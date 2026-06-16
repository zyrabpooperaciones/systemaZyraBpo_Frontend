import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el backend responde 401 Unauthorized (token inválido o expirado)
      if (error.status === 401) {
        // Limpiamos los rastros locales de sesión en el navegador
        sessionStorage.removeItem('zyra_token');
        sessionStorage.removeItem('zyra_usuario');
        sessionStorage.removeItem('zyra_permisos');

        // Redirigimos inmediatamente a la pantalla de login
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
