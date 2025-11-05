import { Component, importProvidersFrom } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule, provideHttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../service/auth/auth.service'; // 👈 importa el servicio

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  message: string = '';
  private baseUrl = environment.baseUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService // 👈 inyecta el servicio
  ) {}

  login() {
    const body = { username: this.username, password: this.password };

    this.http.post(`${this.baseUrl}auth/login`, body).subscribe({
      next: (response: any) => {
        // ✅ Usamos el AuthService para guardar la sesión
        this.auth.loginBackend(response);

        // ✅ Redirigir después del login
        this.router.navigate(['/trabajo']);
      },
      error: () => {
        this.message = '❌ Usuario o contraseña incorrectos';
      }
    });
  }
}


