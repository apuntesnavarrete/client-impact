import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser: { role: string } | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const role = localStorage.getItem('role');
      if (role) {
        this.currentUser = { role };
      }
    }
  }

  loginBackend(data: { accessToken: string; refreshToken: string; role: string }) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('role', data.role);
    }
    this.currentUser = { role: data.role };
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
    }
    this.currentUser = null;
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('accessToken');
    } else {
      return false;
    }
  }

  getUser() {
    return this.currentUser;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }
}

