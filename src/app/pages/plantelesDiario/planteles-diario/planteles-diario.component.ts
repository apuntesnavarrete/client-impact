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
  partidoId: number | null = null; // 👈 nueva variable para el id

  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private urlPlanteles = 'http://50.21.187.205:81/pro/planteles.json';

  ngOnInit() {
    const teamsParam = this.route.snapshot.queryParamMap.get('team');
    const teamsFromUrl = teamsParam ? teamsParam.split(',') : [];

 const idParam = this.route.snapshot.queryParamMap.get('id');
    this.partidoId = idParam ? Number(idParam) : null;

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
      partidoId: this.partidoId // 🔹 agregamos el id del partido
    }));

  console.log('Asistencias a enviar:', asistenciaArray);

  this.http.post('http://50.21.187.205:81/pro/planteles_asistencia.json', asistenciaArray)
    .subscribe({
      next: (res) => {
        console.log('Asistencia enviada correctamente:', res);
        this.mensaje = `✅ Asistencia enviada correctamente para ${asistenciaArray.length} jugador(es).`;
        
        // Limpiar el mensaje después de 10 segundos
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


// Para nuevos jugadores
nuevoJugadorNombre: string = '';

agregarNuevoJugador() {
  if (!this.selectedTeam || !this.nuevoJugadorNombre.trim() || this.partidoId === null) return;

  const equipoId = this.planteles[this.selectedTeam][0]?.teamId || 0; // Tomamos el teamId de un jugador existente si hay

  const nuevoJugador: Jugador = {
    name: this.nuevoJugadorNombre.trim(),
    asistencia: true, // asistencia siempre true
    participantId: Date.now(), // generar un id temporal único
    teamId: equipoId,
  };

  // Agregamos al arreglo local
  this.planteles[this.selectedTeam].push(nuevoJugador);

  // Enviar directamente al backend
  this.http.post('http://50.21.187.205:81/pro/planteles_asistencia.json', [{
    teamId: nuevoJugador.teamId,
    teamName: this.selectedTeam,
    participantId: nuevoJugador.participantId,
    name: nuevoJugador.name,
    dorsal: nuevoJugador.dorsal,
    asistencia: true,
    partidoId: this.partidoId
  }]).subscribe({
    next: (res) => {
      console.log('Nuevo jugador enviado:', res);
      this.mensaje = `✅ Nuevo jugador "${nuevoJugador.name}" agregado y asistencia enviada.`;
      setTimeout(() => this.mensaje = '', 10000);
      this.nuevoJugadorNombre = ''; // limpiar input
    },
    error: (err) => {
      console.error('Error al enviar nuevo jugador:', err);
      this.mensaje = '❌ Error al agregar nuevo jugador.';
    }
  });
}

}

