import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router'; // ✅ correcto

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

  private urlPartidos = 'http://50.21.187.205:81/pro/partidos.json';

  constructor(private http: HttpClient, private router : Router) {
    const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
    const hoy = new Date();
    const diaHoy = dias[hoy.getDay()] as DiasTrabajo;
    this.diaSeleccionado = diaHoy;
  }

  ngOnInit() {
    this.cargarTrabajos();
  }

cargarTrabajos(force: boolean = false) {
  const key = `trabajos-${this.diaSeleccionado}`;
  const guardado = localStorage.getItem(key);

  if (guardado && !force) {
    // Usar cache local si no se fuerza fetch
    this.trabajos = JSON.parse(guardado);
  } else {
    // Traer siempre del servidor
    this.http.get<PartidosJSON>(this.urlPartidos).subscribe({
      next: (data) => {
        const partidosDia = data[this.diaSeleccionado] || [];
        this.trabajos = partidosDia.map(p => ({ ...p, desempate: '', editando: false }));

        // Guardar en localStorage para próximas visitas
        localStorage.setItem(key, JSON.stringify(this.trabajos));
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

  if (tipo === 'P') {
    // Navegar a planteles-diario con equipos en la URL
    const equipos = [partido.equipo1, partido.equipo2].join(',');
    this.router.navigate(['/planteles'], { queryParams: { team: equipos } });
    return;
  }

    if (tipo === 'G') {
    // Navegar a planteles-diario con equipos en la URL
    const equipos = [partido.equipo1, partido.equipo2].join(',');
    this.router.navigate(['/Goles'], { queryParams: { team: equipos } });
    return;
  }
}

  guardarEnServidor() {
    const payload = {
      usuario: this.usuario,
      dia: this.diaSeleccionado,
      trabajos: this.trabajos
    };
    this.http.post('http://50.21.187.205:81/pro/partidos.json', payload).subscribe({
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
  const key = `trabajos-${this.diaSeleccionado}`;
  localStorage.removeItem(key);
  this.cargarTrabajos(true);
}

actualizarDesdeServidor() {
  this.cargarTrabajos(true); // fuerza fetch y sobreescribe localStorage
}
}





  





