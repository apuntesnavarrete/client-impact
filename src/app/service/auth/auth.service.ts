import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = false;
  private currentUser: { username: string; role: string } | null = null;

  login(user: { username: string; passwordHash: string; role: string }) {
    this.loggedIn = true;
    this.currentUser = { username: user.username, role: user.role };
  }

  logout() {
    this.loggedIn = false;
    this.currentUser = null;
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
