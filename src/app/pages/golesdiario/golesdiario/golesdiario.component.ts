import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

interface Asistencia {
  teamId: number;
  teamName: string;
  participantId: number;
  name: string;
  asistencia: boolean;
  goles?: number; // 👈 nuevo campo
  partidoId:number
  dorsal:string
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
private baseUrl = environment.baseUrl;

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
  this.http.get(`${this.baseUrl}asistencias`, { responseType: 'text' })
  .subscribe({
    next: (textData) => {
      try {
        // Quitar cualquier carácter después del último ']'
        const cleanText = textData.substring(0, textData.lastIndexOf(']') + 1);
        const data: Asistencia[] = JSON.parse(cleanText);

        this.asistencias = data
          .filter(item => this.partidoId == null || item.partidoId === this.partidoId)
          .map(item => ({ ...item, goles: item.goles ?? 0 }));

        console.log('Asistencias filtradas:', this.asistencias);
      } catch (err) {
        console.error('Error parseando JSON:', err, 'Texto recibido:', textData);
      }
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
}));  
  this.http.post(`${this.baseUrl}asistencias`, datos)
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
    this.http.post(`${this.baseUrl}asistencias`, [{
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

esNuevo(jugador: Asistencia): boolean {
  return jugador.participantId > 1_000_000_000; // IDs creados con Date.now()
}
}


