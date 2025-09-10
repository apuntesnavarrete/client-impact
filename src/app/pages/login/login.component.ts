import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  message: string = '';

  // Usuario y hash SHA-256 de la contraseña
  private readonly validUsername = 'vic123';
  private readonly validPasswordHash =
    '755a55f7c344c181b8b7deee84146265cc0800cf7b14b30a73db623ede16afa5';

  constructor(private auth: AuthService, private router: Router) {}

  async login() {
    const hash = await this.hashPassword(this.password);

    if (this.username === this.validUsername && hash === this.validPasswordHash) {
      this.auth.login();              // marca al usuario como logueado
      this.router.navigate(['/trabajo']); // redirige a la ruta protegida
    } else {
      this.message = '❌ Usuario o contraseña incorrectos';
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }
}

