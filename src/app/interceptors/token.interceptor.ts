import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../service/auth/auth.service';

export const logInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  console.log('🌐 Petición interceptada:', req.url);

  // ✅ Solo ejecutar si estamos en el navegador
  if (typeof window !== 'undefined' && window.localStorage) {
    const token = localStorage.getItem('accessToken');

    if (token) {
      console.log('🔑 Token agregado al header:');

      // 🧩 Clonamos la petición con el header Authorization
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 🚀 Enviamos la petición y manejamos errores
      return next(clonedRequest).pipe(
     catchError((error: HttpErrorResponse) => {
  console.log('🚨 Error detectado:', error.status, error.message);

  if (error.status === 401) {
    console.log('♻️ Token expirado, intentando refrescar...');
    return authService.refreshToken().pipe(
      switchMap((res: any) => {
        console.log('📦 Respuesta del refresh:');
        const newToken = res?.accessToken;
        if (!newToken) {
          console.log('❌ El backend no devolvió un accessToken');
          return throwError(() => new Error('No access token from refresh'));
        }

        authService.saveAccessToken(newToken);
        console.log('✅ Nuevo token guardado:');

        const retryReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`,
          },
        });
        console.log('🔁 Reintentando petición con nuevo token:', retryReq.url);
        return next(retryReq);
      }),
      catchError(err => {
        console.log('❌ Error al refrescar token:', err);
        return throwError(() => err);
      })
    );
  }

  return throwError(() => error);
})

      );
    } else {
      console.log('⚠️ No hay token en localStorage');
    }
  } else {
    console.log('⚙️ Corriendo en el servidor — sin acceso a localStorage');
  }

  // 🔙 Si no hay token, sigue normal
  return next(req);
};