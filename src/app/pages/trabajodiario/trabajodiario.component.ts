import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth/auth.service';

interface Partido {
  equipo1: string;
  equipo2: string;
  g1?: number;
  g2?: number;
  desempate?: 'L' | 'V' | '';
  editando?: boolean;
}

@Component({
  selector: 'app-trabajo-diario',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './trabajodiario.component.html',
  styleUrls: ['./trabajodiario.component.css']
})
export class TrabajodiarioComponent implements OnInit {
  diasDisponibles: any[] = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
  diaSeleccionado: any;
  usuario: string;
  trabajos: Partido[] = [];
  private urlPartidos: string;

  constructor(
  private http: HttpClient,
  private router: Router,
  public auth: AuthService
) {
  // Días disponibles sin tildes para que coincida con el select
  this.diasDisponibles = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];

  // Día de hoy por defecto
  const hoy = new Date();
  this.diaSeleccionado = this.diasDisponibles[hoy.getDay()];

  // Usuario dinámico
  const user = this.auth.getUser();
  this.usuario = user ? user.username : 'invitado';

  // URL dinámica según usuario
  if (this.usuario === 'vic') {
    this.urlPartidos = 'http://50.21.187.205:81/pro/partidos.json';
  } else if (this.usuario === 'zon') {
    this.urlPartidos = 'http://50.21.187.205:81/ed/partidos.json';
  } else {
    this.urlPartidos = 'http://50.21.187.205:81/default/partidos.json';
  }
}

ngOnInit() {
  this.cargarTrabajos(); // carga automáticamente el día de hoy
}

  cargarTrabajos() {
    this.http.get<any>(this.urlPartidos).subscribe({
      next: (data) => {
        const partidosDia = data[this.diaSeleccionado] || [];
        this.trabajos = partidosDia.map((p: any) => ({
          ...p,
          desempate: p.desempate ?? '', // ✅ conserva "L" o "V" del JSON
          editando: false
        }));
      },
      error: (err) => {
        console.error('Error al cargar partidos:', err);
        this.trabajos = [];
      }
    });
  }

  guardarGoles(partido: Partido) {
    if (partido.g1 === partido.g2 && !partido.desempate) {
      alert('Hay empate, selecciona quién gana el desempate (L o V).');
      return;
    } else if (partido.g1 !== partido.g2) {
      partido.desempate = '';
    }
    partido.editando = false;

    // ✅ Actualiza TODO el día en el mismo endpoint que el botón guardar
    const payload = {
      usuario: this.usuario,
      dia: this.diaSeleccionado,
      trabajos: this.trabajos
    };

    this.http.post(this.urlPartidos, payload).subscribe({
      next: () => console.log('Datos del día actualizados en servidor ✅'),
      error: (err) => console.error('Error al guardar en servidor:', err)
    });
  }

  cambiarDia(event: Event) {
    const valor = (event.target as HTMLSelectElement).value as any;
    this.diaSeleccionado = valor;
    this.cargarTrabajos();
  }

  iniciarEdicion(partido: Partido) {
    partido.editando = true;
  }

  accion(tipo: string, partido: Partido) {
    if (tipo === 'R') this.iniciarEdicion(partido);

    if (tipo === 'P') {
      const equipos = [partido.equipo1, partido.equipo2].join(',');
      this.router.navigate(['/planteles'], { queryParams: { team: equipos } });
    }

    if (tipo === 'G') {
      const equipos = [partido.equipo1, partido.equipo2].join(',');
      this.router.navigate(['/Goles'], { queryParams: { team: equipos } });
    }
  }

  guardarEnServidor() {
    const payload = {
      usuario: this.usuario,
      dia: this.diaSeleccionado,
      trabajos: this.trabajos
    };
    this.http.post(this.urlPartidos, payload).subscribe({
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
}






  





