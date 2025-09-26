import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth/auth.service';


interface Partido {
  id: number;
  equipo1: string;
  equipo2: string;
  g1?: number | null;
  g2?: number | null;
  desempate: string;
  editando: boolean;
  liga: number;
  categoria: number;
  dia: string;
}


const partidos: Partido[] = [
  {
    id: 1,
    equipo1: "Fresas_FC",
    equipo2: "AntiFB",
    desempate: "",
    editando: false,
    liga: 1,
    categoria: 6,
    dia: "jueves"
  },
  {
    id: 2,
    equipo1: "AntiFB",
    equipo2: "Papis_Cachondos",
    desempate: "",
    editando: false,
    liga: 1,
    categoria: 6,
    dia: "jueves"
  },
  {
    id: 3,
    equipo1: "Rayados",
    equipo2: "HeroesFB",
    desempate: "",
    editando: false,
    liga: 1,
    categoria: 6,
    dia: "jueves"
  }
];

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
  this.http.get<any[]>(this.urlPartidos).subscribe({
    next: (data) => {
      // ✅ Filtra los partidos que tengan el día seleccionado
      const partidosDia = data.filter(p => p.dia === this.diaSeleccionado);

      this.trabajos = partidosDia.map((p: any) => ({
        ...p,
        desempate: p.desempate ?? '', // conserva "L" o "V"
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
   const payload = this.trabajos.map((p: any) => ({
    id: p.id,
    equipo1: p.equipo1,
    equipo2: p.equipo2,
    g1: p.g1 != null ? Number(p.g1) : null,
    g2: p.g2 != null ? Number(p.g2) : null,
    desempate: p.desempate ?? '',
    editando: !!p.editando,
    liga: p.liga,
    categoria: p.categoria,
    dia: p.dia
  }));

  console.log(payload)

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
    this.router.navigate(['/planteles'], { 
      queryParams: { 
        team: equipos,
        id: partido.id // 🔹 agregamos el id del partido
      } 
    });
  }

  if (tipo === 'G') {
    const equipos = [partido.equipo1, partido.equipo2].join(',');
    this.router.navigate(['/Goles'], { 
      queryParams: { 
        team: equipos,
        id: partido.id // 🔹 agregamos el id del partido
      } 
    });
  }
}


  guardarEnServidor() {
  // 🔹 Preparar payload con la misma estructura plana
  const payload = this.trabajos.map(p => ({
    id: p.id,
    equipo1: p.equipo1,
    equipo2: p.equipo2,
    g1: p.g1 != null ? Number(p.g1) : null,
    g2: p.g2 != null ? Number(p.g2) : null,
    desempate: p.desempate ?? '',
    editando: !!p.editando,
    liga: p.liga,
    categoria: p.categoria,
    dia: p.dia
  }));

  // 🔹 Enviar al servidor


  this.http.post(this.urlPartidos, payload).subscribe({
    next: () => alert('Datos guardados en servidor ✅'),
    error: (err) => console.error('Error al guardar en servidor:', err)
  });
}

  descargarJSON() {
     const data = this.trabajos.map((p: any) => ({
    id: p.id,
    equipo1: p.equipo1,
    equipo2: p.equipo2,
    g1: p.g1 != null ? Number(p.g1) : null,
    g2: p.g2 != null ? Number(p.g2) : null,
    desempate: p.desempate ?? '',
    editando: !!p.editando,
    liga: p.liga,
    categoria: p.categoria,
    dia: p.dia
  }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trabajos-${this.diaSeleccionado}-${this.usuario}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}






  





