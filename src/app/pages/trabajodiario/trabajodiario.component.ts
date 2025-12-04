import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth/auth.service';
import { getUrl } from '../../config';


interface Partido {
  torneoId: number;
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



@Component({
  selector: 'app-trabajo-diario',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
this.usuario = user ? user.role : 'invitado';
 // URL base
const baseUrl = getUrl();

//this.urlPartidos = getUrl() + 'pro/partidos.json'; // agregas la carpeta según el usuario



  this.urlPartidos = baseUrl + 'partidos';

}

ngOnInit() {
  this.cargarTrabajos(); // carga automáticamente el día de hoy
}



cargarTrabajos() {
  this.http.get<any[]>(this.urlPartidos).subscribe({
    next: (data) => {
      let partidosFiltrados = data;

      // ✅ Primero: filtrar por usuario
      if (this.usuario === 'pro') {
        partidosFiltrados = partidosFiltrados.filter(p => [43, 39,47].includes(p.torneoId));
      } else if (this.usuario === 'ed') {
        partidosFiltrados = partidosFiltrados.filter(p => ![43, 39,47].includes(p.torneoId));
      }
console.log('Partidos partidosFiltrados:', partidosFiltrados);
      // ✅ Segundo: filtrar por día
      partidosFiltrados = partidosFiltrados.filter(p => p.dia === this.diaSeleccionado);

      // ✅ Finalmente, preparar los datos
      this.trabajos = partidosFiltrados.map(p => ({
        ...p,
        g1: p.g1 ?? null,
        g2: p.g2 ?? null,
        desempate: p.desempate ?? '',
        editando: false
      }));

      console.log('Partidos cargados:', this.trabajos);
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

  // Solo el partido que se editó
  const payload = {
    id: partido.id,
    equipo1: partido.equipo1,
    equipo2: partido.equipo2,
    g1: partido.g1 != null ? Number(partido.g1) : null,
    g2: partido.g2 != null ? Number(partido.g2) : null,
    desempate: partido.desempate ?? '',
    liga: partido.liga,
    categoria: partido.categoria,
    dia: partido.dia,
      torneoId: partido.torneoId // 🔹 agregado

  };

  console.log('Payload a enviar:', payload);





  // const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    this.http.put(`${this.urlPartidos}/${partido.id}`, payload, {/* headers*/ }).subscribe({
      next: () => console.log('Partido actualizado en servidor ✅'),
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
        id: partido.id ,// 🔹 agregamos el id del partido
          torneoId: partido.torneoId // 🔹 agregado

      } 
    });
  }

  if (tipo === 'G') {
    const equipos = [partido.equipo1, partido.equipo2].join(',');
    this.router.navigate(['/Goles'], { 
      queryParams: { 
        team: equipos,
        id: partido.id,
                  torneoId: partido.torneoId // 🔹 agregado
 // 🔹 agregamos el id del partido
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
    dia: p.dia,
      torneoId: p.torneoId // 🔹 agregado

  }));

  // 🔹 Enviar al servidor




    this.http.post(this.urlPartidos, payload, {   }).subscribe({
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

  logout() {
    this.auth.logout();        // Borra la sesión
    this.router.navigate(['/']);  // Redirige al login
  }
}






  





