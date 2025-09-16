import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Asistencia {
  teamId: number;
  teamName: string;
  participantId: number;
  name: string;
  asistencia: boolean;
  goles?: number; // 👈 nuevo campo
}

@Component({
  selector: 'app-golesdiario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './golesdiario.component.html',
  styleUrls: ['./golesdiario.component.css']
})
export class GolesdiarioComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  asistencias: Asistencia[] = [];
  teamsFromUrl: string[] = [];
  selectedTeam: string | null = null;
mensaje: string = '';

  ngOnInit(): void {
    const teamsParam = this.route.snapshot.queryParamMap.get('team');
    this.teamsFromUrl = teamsParam ? teamsParam.split(',') : [];
    console.log('Equipos desde la URL:', this.teamsFromUrl);
  this.selectedTeam = this.teamsFromUrl[0] || null;

    this.cargarAsistencias();
  }

 cargarAsistencias() {
  this.http.get<Asistencia[]>('http://localhost:3004/pro/planteles_asistencia.json')
    .subscribe({
      next: (data) => {
        this.asistencias = data.map(item => ({
          ...item,
          goles: item.goles != null ? item.goles : 0 // mantener goles existentes o 0
        }));
        console.log('Asistencias cargadas:', this.asistencias);
      },
      error: (err) => console.error('Error al cargar asistencias:', err)
    });
}

  get participantesFiltrados(): Asistencia[] {
    if (!this.selectedTeam) return [];
    return this.asistencias.filter(a => a.teamName === this.selectedTeam);
  }

guardarGoles() {
  const datos = this.participantesFiltrados; // solo el equipo seleccionado
  this.http.post('http://localhost:3004/pro/planteles_goles.json', datos)
    .subscribe({
      next: res => {
        console.log('Guardado en backend:', res);
        this.mensaje = `✅ Goles actualizados correctamente para ${datos.length} jugador(es).`;

        // Limpiar el mensaje después de 3 segundos
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: err => {
        console.error('Error al guardar:', err);
        this.mensaje = '❌ Error al guardar goles. Intenta de nuevo.';
      }
    });
}

get totalGoles(): number {
  return this.participantesFiltrados.reduce((sum, j) => sum + (j.goles || 0), 0);
}
}


