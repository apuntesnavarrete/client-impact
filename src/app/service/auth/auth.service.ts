import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = false;
  private currentUser: { username: string; role: string } | null = null;

  constructor() {
    // Al iniciar la app, revisa si hay usuario en localStorage
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.loggedIn = true;
    }
  }

  login(user: { username: string; passwordHash: string; role: string }) {
    this.loggedIn = true;
    this.currentUser = { username: user.username, role: user.role };
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
  }

  logout() {
    this.loggedIn = false;
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  isLoggedIn() {
    return this.loggedIn;
  }

  getUser() {
    return this.currentUser;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }
}

