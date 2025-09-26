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
  partidoId:number
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
  partidoId: number | null = null; // 🔹 Nuevo: almacenar id del partido

  asistencias: Asistencia[] = [];
  teamsFromUrl: string[] = [];
  selectedTeam: string | null = null;
mensaje: string = '';

  ngOnInit(): void {
    const teamsParam = this.route.snapshot.queryParamMap.get('team');
    this.teamsFromUrl = teamsParam ? teamsParam.split(',') : [];
    console.log('Equipos desde la URL:', this.teamsFromUrl);
  this.selectedTeam = this.teamsFromUrl[0] || null;
const idParam = this.route.snapshot.queryParamMap.get('id'); // 🔹 obtener id desde URL
    this.partidoId = idParam ? Number(idParam) : null;
    this.cargarAsistencias();
  }

  cargarAsistencias() {
    this.http.get<Asistencia[]>('http://50.21.187.205:81/pro/planteles_asistencia.json')
      .subscribe({
        next: (data) => {
          // 🔹 Filtrar por partidoId si existe
          this.asistencias = data
            .filter(item => this.partidoId == null || item.partidoId === this.partidoId)
            .map(item => ({
              ...item,
              goles: item.goles != null ? item.goles : 0
            }));
          console.log('Asistencias filtradas por partido:', this.asistencias);
        },
        error: (err) => console.error('Error al cargar asistencias:', err)
      });
  }

  get participantesFiltrados(): Asistencia[] {
    if (!this.selectedTeam) return [];
    return this.asistencias.filter(a => a.teamName === this.selectedTeam);
  }

guardarGoles() {
const datos = this.participantesFiltrados.map(j => ({
  ...j,
  partidoId: this.partidoId // 🔹 importante
}));  this.http.post('http://50.21.187.205:81/pro/planteles_goles.json', datos)
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

cambiarAsistencia(jugador: Asistencia) {
  jugador.asistencia = !jugador.asistencia; // cambia true a false o false a true

  // Opcional: enviar cambio al backend inmediatamente
  if (this.partidoId !== null) {
    this.http.post('http://50.21.187.205:81/pro/planteles_asistencia.json', [{
      ...jugador,
      asistencia: jugador.asistencia,
      partidoId: this.partidoId
    }]).subscribe({
      next: res => {
        console.log('Asistencia actualizada:', res);
        this.mensaje = `✅ Asistencia de "${jugador.name}" actualizada a ${jugador.asistencia}.`;
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: err => {
        console.error('Error al actualizar asistencia:', err);
        this.mensaje = '❌ Error al actualizar asistencia.';
      }
    });
  }
}

}


