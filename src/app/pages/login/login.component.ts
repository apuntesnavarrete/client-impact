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
  passwordHash: '07a24954ade82eae92abbb40fc522955e0df693d6051a707b58f795bf4f5d5cc',
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

  const user = this.users.find(
    u => u.username === this.username && u.passwordHash === hash
  );

  if (user) {
    this.auth.login(user);  // ✅ pasas el usuario encontrado
    this.router.navigate(['/trabajo']);
  } else {
    this.message = '❌ Usuario o contraseña incorrectos';
  }
}

  private hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  }
}


