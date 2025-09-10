import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { TrabajodiarioComponent } from './pages/trabajodiario/trabajodiario.component';
import { authGuard } from './auth/guard.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
    { path: 'trabajo', component: TrabajodiarioComponent, canActivate: [authGuard] }

];