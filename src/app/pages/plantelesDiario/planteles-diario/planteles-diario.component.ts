import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

// Jugador que vamos a mostrar en la tabla
interface Jugador {
  name: string;
  asistencia: boolean;
  participantId: number;
  teamId: number;
  dorsal?: number; // 👈 opcional
}

// Tipo de dato que viene del JSON
interface RawData {
  participants: {
    id: number;
    name: string;
    Photo?: string;
  };
  teams: {
    id: number;
    name: string;
    logo?: string;
  };
}

@Component({
  selector: 'app-planteles-diario',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './planteles-diario.component.html',
   styleUrls: ['./planteles-diario.component.css']
})
export class PlantelesDiarioComponent implements OnInit {
  planteles: Record<string, Jugador[]> = {}; // Map: equipo -> jugadores
  selectedTeam: string | null = null;
mensaje: string = ''; // 👈 nuevo

  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private urlPlanteles = 'http://50.21.187.205:81/pro/planteles.json';

  ngOnInit() {
    const teamsParam = this.route.snapshot.queryParamMap.get('team');
    const teamsFromUrl = teamsParam ? teamsParam.split(',') : [];

    console.log('Equipos desde la URL:', teamsFromUrl);
    this.cargarPlanteles(teamsFromUrl);
  }

  get plantelesKeys(): string[] {
    return Object.keys(this.planteles);
  }

 cargarPlanteles(teamsFilter: string[]) {
  this.http.get<RawData[]>(this.urlPlanteles).subscribe({
    next: (data) => {
      this.planteles = {};

      // Inicializa equipos filtrados aunque no tengan jugadores
      teamsFilter.forEach(team => this.planteles[team] = []);

      data.forEach((item) => {
        const teamName = item.teams.name;
        if (teamsFilter.length && !teamsFilter.includes(teamName)) return;

        if (!this.planteles[teamName]) {
          this.planteles[teamName] = [];
        }

        this.planteles[teamName].push({
          name: item.participants.name,
          asistencia: false,
          participantId: item.participants.id,
          teamId: item.teams.id,
        });
      });

      this.selectedTeam = this.plantelesKeys[0] || null;
      console.log('Planteles cargados:', this.planteles);
    },
    error: (err) => {
      console.error('Error al cargar planteles:', err);
      alert('No se pudieron cargar los planteles.');
    },
  });
}


enviarAsistencia() {
  if (!this.selectedTeam) return;

  const asistenciaArray = this.planteles[this.selectedTeam]
    .filter(jugador => jugador.asistencia)
    .map(jugador => ({
      teamId: jugador.teamId,
      teamName: this.selectedTeam,
      participantId: jugador.participantId,
      name: jugador.name,
      dorsal: jugador.dorsal,
      asistencia: jugador.asistencia,
    }));

  console.log('Asistencias a enviar:', asistenciaArray);

  this.http.post('http://localhost:3004/pro/planteles_asistencia.json', asistenciaArray)
    .subscribe({
      next: (res) => {
        console.log('Asistencia enviada correctamente:', res);
        this.mensaje = `✅ Asistencia enviada correctamente para ${asistenciaArray.length} jugador(es).`;
        
        // Limpiar el mensaje después de 3 segundos
        setTimeout(() => this.mensaje = '', 10000);
      },
      error: (err) => {
        console.error('Error al enviar asistencia:', err);
        this.mensaje = '❌ Error al enviar asistencia. Intenta de nuevo.';
      }
    });
}

  trackByJugador(index: number, jugador: Jugador) {
    return jugador.participantId;
  }

    // 👉 MÉTODOS PARA EL CONTEO
 getSeleccionados(): number {
  if (!this.selectedTeam) return 0;
  const jugadores = this.planteles?.[this.selectedTeam] || [];
  return jugadores.filter(j => j.asistencia).length;
}

getTotal(): number {
  if (!this.selectedTeam) return 0;
  return this.planteles?.[this.selectedTeam]?.length || 0;
}
}

