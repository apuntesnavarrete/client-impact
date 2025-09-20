import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Team {
  id: number;
  name: string;
  logo: string;
}

interface Versus {
  equipo1: string;
  equipo2: string;
  desempate: string;
  editando: boolean;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  imports: [CommonModule, FormsModule],
})
export class AdminComponent implements OnInit {
  teams: Team[] = [];
  dia = '';
  versus: Versus[] = [
    { equipo1: '', equipo2: '', desempate: '', editando: false }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http
      .get<any[]>('http://192.168.0.19:8080/api/v1/rosters/tournament/43')
      .subscribe(data => {
        this.teams = data.map(item => ({
          id: item.teams?.id,
          name: item.teams?.name,
          logo: item.teams?.logo
        }));
      });
  }

  addVersus() {
    this.versus.push({ equipo1: '', equipo2: '', desempate: '', editando: false });
  }

  submit() {
    const result: Record<string, Versus[]> = {
      [this.dia.toLowerCase()]: this.versus
    };
    console.log(result);
    this.downloadJson(result, 'partidos.json');
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
