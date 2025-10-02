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
  g1?: number;
  g2?: number;
  desempate: string;
  editando: boolean;
  dia: string;
  torneoId: number;
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

  versus: Versus[] = [];   // partidos en edición (frontend)
  partidos: Versus[] = []; // partidos cargados desde backend

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
        this.teams = data.map(item => ({
          id: item.teams?.id,
          name: item.teams?.name,
          logo: item.teams?.logo
        }));
      });
  }

  /** 👉 Agregar partido con ID temporal */
  addVersus() {
    const id = this.versus.length + 1;
    this.versus.push({
      id,
      equipo1: '',
      equipo2: '',
      desempate: '',
      editando: false,
      dia: this.dia,
      torneoId: this.selectedTournamentId
    });
  }

  /** 👉 Enviar partidos nuevos al backend */
  submit() {
    this.http.post(this.url, this.versus).subscribe({
      next: () => {
        console.log('Todos los partidos agregados ✅');
        this.versus = []; // limpia los partidos que estaban en edición
        this.loadPartidos(); // recarga desde backend
      },
      error: (err) => console.error('Error al guardar partidos:', err)
    });
  }

  /** 👉 Descargar JSON externo (ejemplo: planteles) */
  downloadFromApi() {
    const tournamentId = this.selectedTournamentId;
    this.http
      .get(`http://192.168.0.19:8080/api/v1/rosters/tournament/${tournamentId}`)
      .subscribe(data => {
        this.downloadJson(data, 'planteles.json');
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

  // 👉 Cargar todos los partidos desde el backend
  loadPartidos() {
    this.http.get<Versus[]>(this.url).subscribe({
      next: (data) => (this.partidos = data),
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
}

