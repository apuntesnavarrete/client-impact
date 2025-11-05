import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser: { role: string } | null = null;
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

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
    //  localStorage.setItem('refreshToken', data.refreshToken);
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
refreshToken() {
  return this.http.get(`${this.baseUrl}/auth/refresh`, { withCredentials: true }).pipe(
    tap((res: any) => console.log('🌐 Respuesta del refresh:', res))
  );
}

saveAccessToken(token: string) {
  localStorage.setItem('accessToken', token);
}

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }
}

