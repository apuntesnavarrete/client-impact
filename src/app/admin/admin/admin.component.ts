import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Console } from 'console';

interface Team {
  id: number;
  name: string;
  logo: string;
}


interface Versus {
  id: number;       // numérico ahora
  equipo1: string;
  equipo2: string;
  desempate: string;
  editando: boolean;
  liga: number;
  categoria: number;
  dia: string;
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
 
   ligasDisponibles = [
    { id: 1, nombre: 'PRO' },
    { id: 2, nombre: 'ED' }
  ];
  categoriasDisponibles = [
    { id: 6, nombre: 'Libre' },
    { id: 11, nombre: 'Mixta' }
  ];
   ligaSeleccionada: number = 1;
  categoriaSeleccionada: number = 6;
   dia = '';
  versus: Versus[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http
      .get<any[]>('http://192.168.0.19:8080/api/v1/teams-tournament/tournament/43')
      .subscribe(data => {

        console.log(data)

        this.teams = data.map(item => ({
          id: item.teams?.id,
          name: item.teams?.name,
          logo: item.teams?.logo
        }));
      });
  }

  /** 👉 Agregar partido con ID único */
  addVersus() {
    const id = this.versus.length + 1;

    // Si quieres formato largo (Miercoles-1)

    // O si quieres formato corto (M1, M2, etc.)
    // const firstLetter = this.dia.charAt(0).toUpperCase();
    // const id = `${firstLetter}${count}`;

    this.versus.push({
      id,
      equipo1: '',
      equipo2: '',
      desempate: '',
      editando: false,
      liga: this.ligaSeleccionada,
      categoria: this.categoriaSeleccionada,
      dia: this.dia
    });
  }


 submit() {
    console.log(this.versus);
    this.downloadJson(this.versus, 'partidos.json');
  }

  /** 👉 Descargar el JSON que viene del endpoint */
  downloadFromApi() {
    this.http
      .get('http://192.168.0.19:8080/api/v1/rosters/tournament/43')
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
}

