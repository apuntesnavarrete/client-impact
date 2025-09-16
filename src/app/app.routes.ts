import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { TrabajodiarioComponent } from './pages/trabajodiario/trabajodiario.component';
import { authGuard } from './auth/guard.guard';
import { PlantelesDiarioComponent } from './pages/plantelesDiario/planteles-diario/planteles-diario.component';
import { GolesdiarioComponent } from './pages/golesdiario/golesdiario/golesdiario.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
    { path: 'trabajo', component: TrabajodiarioComponent, canActivate: [authGuard] },
    { path: 'planteles', component: PlantelesDiarioComponent},
    { path: 'Goles', component: GolesdiarioComponent}

];