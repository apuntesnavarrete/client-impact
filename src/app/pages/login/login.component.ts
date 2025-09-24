import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth/auth.service';
import * as CryptoJS from 'crypto-js';

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
 private readonly users = [
  {
    username: 'vic',
    passwordHash: '755a55f7c344c181b8b7deee84146265cc0800cf7b14b30a73db623ede16afa5',
    role: 'admin'
  },
  {
    username: 'zon',
    passwordHash: '69186c5f798ab56f3bfbff4c9128b66610b86852146303607243ebc3a2bb68d8',
    role: 'player'
  }
];

  constructor(private auth: AuthService, private router: Router) {}

login() {
  const hash = this.hashPassword(this.password);
console.log(hash)
console.log(this.hashPassword)

  const user = this.users.find(
    u => u.username === this.username && u.passwordHash === hash
  );

  if (user) {
    this.auth.login(user);  // ✅ pasas el usuario encontrado
    this.router.navigate(['/trabajo']);
    console.log(user)
  } else {
    this.message = '❌ Usuario o contraseña incorrectos';
  }
}

  private hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  }
}


