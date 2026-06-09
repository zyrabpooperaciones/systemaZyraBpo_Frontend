import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el backend responde 401 Unauthorized o 403 Forbidden (token inválido o expirado)
      if (error.status === 401 || error.status === 403) {
        // Limpiamos los rastros locales de sesión en el navegador
        sessionStorage.removeItem('zyra_token');
        sessionStorage.removeItem('zyra_usuario');

        // Redirigimos inmediatamente a la pantalla de login
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
