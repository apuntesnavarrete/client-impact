import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { getUrl } from '../../config';

interface Team {
  id: number;
  name: string;
  logo: string;
}

interface Versus {
  id: number;
  equipo1: string;
  equipo2: string;
  equipo1Id?: number;
  equipo2Id?: number;
  g1?: number;
  g2?: number;
  desempate: string;
  editando: boolean;
  dia: string;
  torneoId: number;
  jornada: number; 
  matchdate: string | null; // ✅ new field

  // ✅ new field
}

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  imports: [CommonModule, FormsModule],
})
export class AdminComponent implements OnInit {
  teams: Team[] = [];
  diasDisponibles = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
  dia = '';
  plantelesJSON: string = ''; // <- aquí se mostrará el JSON de planteles
plantelesFiltrados: any[] = [];

  versus: Versus[] = [];   // partidos en edición (frontend)
  partidos: Versus[] = []; // partidos cargados desde backend
transformedJSON: string = ''; // 🔹 para guardar el JSON transformado y mostrarlo
plantelesTemporalesJSON: string = ''; // ← para mostrar los temporales

  // Opciones de torneo
  torneos = [
    { id: 44, nombre: "ED-MIXTA_DOMINICAL-24C" },
    { id: 43, nombre: "PRO-LIBRE_GOLDEN-25C" },
    { id: 39, nombre: "PRO-MIXTA-24C" },
    { id: 42, nombre: "ED-MIXTA_SABATINA-25C" },
    { id: 41, nombre: "ED-LIBRE-25A" },
    { id: 40, nombre: "ED-LIBRE_SABATINA-25C" },
    { id: 38, nombre: "ED-SUB23-25C" },
    { id: 28, nombre: "ED-FEMENIL_DOMINICAL-25A" }
  ];

  selectedTournamentId = 43; // valor inicial
  baseUrl = getUrl();
  url = this.baseUrl + 'partidos';
planteles: any[] = []; // store the roster data
jornada: number | null = null;
matchDate: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadTeams();
    this.loadPartidos();
  }

  loadTeams() {
    const tournamentId = this.selectedTournamentId;
    this.http
      .get<any[]>(`http://192.168.0.19:8080/api/v1/teams-tournament/tournament/${tournamentId}`)
      .subscribe(data => {
        console.log(data)
        this.teams = data.map(item => ({
          id: item.teams?.id,
          name: item.teams?.name,
          logo: item.teams?.logo
        }));
      });
  }

  /** 👉 Agregar partido con ID temporal */
addVersus() {
  if (this.jornada === null) {
    alert('Por favor ingresa la jornada antes de crear partidos.');
    return;
  }

  const id = Number(this.versus.length + 1);

  this.versus.push({
    id,
    equipo1: '',
    equipo2: '',
    equipo1Id: undefined,
    equipo2Id: undefined,
    desempate: '',
    editando: false,
    dia: this.dia,
    torneoId: Number(this.selectedTournamentId),
    jornada: this.jornada ,// ✅ include jornada
    matchdate: this.matchDate // ✅ added here

  });
}

  /** 👉 Enviar partidos nuevos al backend */
submit() {
  const readyMatches = this.versus.map(v => ({
    ...v,
    equipo1: this.teams.find(t => t.id === v.equipo1Id)?.name || '',
    equipo2: this.teams.find(t => t.id === v.equipo2Id)?.name || '',
  }));

  this.http.post(this.url, readyMatches).subscribe({
    next: () => {
      console.log('✅ Partidos guardados');
      this.versus = [];
      this.loadPartidos();
    },
    error: err => console.error('❌ Error al guardar:', err)
  });
}

  /** 👉 Descargar JSON externo (ejemplo: planteles) */
/** 👉 Descargar JSON externo (ejemplo: planteles) */
downloadFromApi() {
  const tournamentId = this.selectedTournamentId;

  this.http
    .get(`http://192.168.0.19:8080/api/v1/rosters/tournament/${tournamentId}`)
    .subscribe(data => {
      // 🔹 Aquí agregamos el ID del torneo en el nombre del archivo
      const filename = `planteles-${tournamentId}.json`;
      this.downloadJson(data, filename);
    });
}

 private downloadJson(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

/** 👉 Enviar JSON de planteles al backend para guardarlo */
uploadToBackend() {
  const tournamentId = this.selectedTournamentId;

  this.http
    .get(`http://192.168.0.19:8080/api/v1/rosters/tournament/${tournamentId}`)
    .subscribe(data => {

       const backendUrl = `${getUrl()}planteles/${tournamentId}`;

      this.http.post(backendUrl, data).subscribe({
      
          next: (res) => console.log('✅ Archivo enviado al backend:', res),
          error: (err) => console.error('❌ Error al enviar al backend:', err)
        });
    });
}



  // 👉 Cargar todos los partidos desde el backend
loadPartidos() {
  this.http.get<Versus[]>(this.url).subscribe({
    next: (data) => {
      this.partidos = data.map(p => ({ ...p, id: Number(p.id) }));
    },
    error: (err) => console.error('Error al cargar partidos:', err),
  });
}

  // 👉 Eliminar partido
  deletePartido(id: number) {
    if (!confirm('¿Seguro que deseas eliminar este partido?')) return;

    this.http.delete(`${this.url}/${id}`).subscribe({
      next: () => {
        console.log(`Partido ${id} eliminado ✅`);
        this.partidos = this.partidos.filter((p) => p.id !== id);
      },
      error: (err) => console.error('Error al eliminar partido:', err),
    });
  }


 // add this property
selectedMatch: Versus | null = null;

mostrarinfo(id: number) {
  const match = this.partidos.find(p => p.id === id);

  if (!match) {
    console.warn(`No se encontró el partido con id ${id}`);
    return;
  }

  this.selectedMatch = match;

  // 🔹 Crear JSON transformado tipo "finalData"
  const transformedMatch = {
    teamHome: match.equipo1Id ?? null,
    teamAway: match.equipo2Id ?? null,
    date: match.matchdate,
    matchday: match.jornada,
    localgoals: match.g1 ?? null,
    visitangoals: match.g2 ?? null,
    ganadorDesempate: match.desempate || null,
    tournaments: match.torneoId,
    pointsLocal:
      match.g1 != null && match.g2 != null
        ? match.g1 > match.g2
          ? 3
          : match.g1 < match.g2
          ? 0
          : match.desempate === 'local'
          ? 2
          : match.desempate === 'visitante'
          ? 1
          : 1
        : 0,
    pointsVisitan:
      match.g1 != null && match.g2 != null
        ? match.g2 > match.g1
          ? 3
          : match.g2 < match.g1
          ? 0
          : match.desempate === 'visitante'
          ? 2
          : match.desempate === 'local'
          ? 1
          : 1
        : 0,
  };

  // 🔹 Guardar para mostrar en HTML y copiar
  this.transformedJSON = JSON.stringify(transformedMatch, null, 2);

  console.log('🎯 Partido transformado (listo para copiar):', transformedMatch);

  // 🔹 Cargar planteles filtrados
this.http
  .get(`http://50.21.187.205:81/pro/planteles_asistencia.json`, { responseType: 'text' })
  .subscribe({
    next: (textData) => {
      try {
        const cleanText = textData.substring(0, textData.lastIndexOf(']') + 1);
        const data = JSON.parse(cleanText);

        const filtrados = data.filter(
          (item: any) =>
            item.torneoId === match.torneoId && item.partidoId === match.id
        );

        // 🔹 Separamos los jugadores por tipo de ID
        const temporales = filtrados.filter((p: any) => p.participantId > 1_000_000_000);
        const reales = filtrados.filter((p: any) => p.participantId <= 1_000_000_000);

        // 🔹 Los reales se imprimen igual que antes
        const transformedReales = reales.map((p: any) => ({
          annotations: p.goles ?? 0,
          attendance: p.asistencia === true,
          participants: p.participantId,
          teams: p.teamId
        }));

        this.plantelesFiltrados = transformedReales;
        this.plantelesJSON = JSON.stringify(transformedReales, null, 2);

        // 🔹 Los temporales se guardan en otro JSON
        const transformedTemporales = temporales.map((p: any) => ({
          annotations: p.goles ?? 0,
          attendance: p.asistencia === true,
          participants: p.participantId,
          teams: p.teamId
        }));

        // Guardar en otra propiedad
        this.plantelesTemporalesJSON = JSON.stringify(transformedTemporales, null, 2);

        console.log('✅ Reales:', transformedReales);
        console.log('🕒 Temporales:', transformedTemporales);

      } catch (err) {
        this.plantelesJSON = 'Error parseando JSON: ' + err;
        console.error('Error parseando JSON:', err, 'Texto recibido:', textData);
      }
    },
    error: (err) => {
      this.plantelesJSON = 'Error al cargar planteles: ' + err.message;
      console.error('Error al cargar planteles:', err);
    },
  });


}
}

