import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  // Inyectamos el servicio de autenticación y el enrutador de Angular
  const authService = inject(AuthService);
  const router = inject(Router);

  // El guardia revisa si existe un token activo en la pestaña actual
  if (authService.estaAutenticado()) {
    return true; // ¡Luz verde! El guardia abre la reja visual y permite ver la pantalla
  }

  // Si no está autenticado, lo redirigimos al Login de inmediato
  router.navigate(['/login']);
  return false; // Cierra el acceso por completo
};