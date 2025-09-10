import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

type DiasTrabajo = 'jueves' | 'viernes';

interface Partido {
  equipo1: string;
  equipo2: string;
  g1?: number;
  g2?: number;
  desempate?: 'L' | 'V' | '';
  editando?: boolean;
}

interface PartidosJSON {
  jueves: Partido[];
  viernes: Partido[];
}

@Component({
  selector: 'app-trabajo-diario',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './trabajodiario.component.html',
  styleUrls: ['./trabajodiario.component.css']
})
export class TrabajodiarioComponent implements OnInit {
  diasDisponibles: DiasTrabajo[] = ['jueves', 'viernes'];
  diaSeleccionado: DiasTrabajo;
  usuario: string = 'victor';
  trabajos: Partido[] = [];

  private urlPartidos = 'http://localhost:3004/pro/partidos.json';

  constructor(private http: HttpClient) {
    const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
    const hoy = new Date();
    const diaHoy = dias[hoy.getDay()] as DiasTrabajo;
    this.diaSeleccionado = diaHoy;
  }

  ngOnInit() {
    this.cargarTrabajos();
  }

  cargarTrabajos() {
    const guardado = localStorage.getItem(`trabajos-${this.diaSeleccionado}`);
    if (guardado) {
      this.trabajos = JSON.parse(guardado);
    } else {
      // Traer desde la URL
      this.http.get<PartidosJSON>(this.urlPartidos).subscribe({
        next: (data) => {
          const partidosDia = data[this.diaSeleccionado] || [];
          this.trabajos = partidosDia.map(p => ({ ...p, desempate: '', editando: false }));
        },
        error: (err) => {
          console.error('Error al cargar partidos:', err);
          this.trabajos = [];
        }
      });
    }
  }

  cambiarDia(event: Event) {
    const valor = (event.target as HTMLSelectElement).value as DiasTrabajo;
    this.diaSeleccionado = valor;
    this.cargarTrabajos();
  }

  iniciarEdicion(partido: Partido) {
    partido.editando = true;
  }

  guardarGoles(partido: Partido) {
    if (partido.g1 === partido.g2 && !partido.desempate) {
      alert('Hay empate, selecciona quién gana el desempate (L o V).');
      return;
    } else if (partido.g1 !== partido.g2) {
      partido.desempate = '';
    }
    partido.editando = false;
    localStorage.setItem(`trabajos-${this.diaSeleccionado}`, JSON.stringify(this.trabajos));
  }

  accion(tipo: string, partido: Partido) {
    if (tipo === 'R') {
      this.iniciarEdicion(partido);
    } else {
      console.log(`Botón ${tipo} presionado para:`, partido);
    }
  }

  mostrarArray() {
    console.log('Array de trabajos:', this.trabajos);
  }

  guardarEnServidor() {
    const payload = {
      usuario: this.usuario,
      dia: this.diaSeleccionado,
      trabajos: this.trabajos
    };
    this.http.post('http://localhost:3004/pro/partidos.json', payload).subscribe({
      next: () => alert('Datos guardados en servidor ✅'),
      error: (err) => console.error(err)
    });
  }

  descargarJSON() {
    const data = {
      usuario: this.usuario,
      dia: this.diaSeleccionado,
      trabajos: this.trabajos
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trabajos-${this.diaSeleccionado}-${this.usuario}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

resetLocalStorage() {
  localStorage.removeItem(`trabajos-${this.diaSeleccionado}`);

  // Traer desde servidor (POST/GET) en lugar de archivo JSON original
  this.http.get(`http://localhost:3004/pro/partidos.json`).subscribe({
    next: (data: any) => {
      const partidosDia = data[this.diaSeleccionado] || [];
      this.trabajos = partidosDia.map((p: any) => ({
        ...p,
        desempate: p.desempate || '',
        editando: false
      }));
    },
    error: (err) => {
      console.error('Error al cargar partidos:', err);
      this.trabajos = [];
    }
  });
}
}





  





