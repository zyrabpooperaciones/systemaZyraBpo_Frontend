import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    // 1. Obtener el nombre del módulo desde la data de la ruta o desde el path
    const modulo = route.data?.['modulo'] || route.routeConfig?.path;
    
    // 2. Rutas del dashboard que no requieren un permiso específico (públicas/generales)
    const rutasPublicas = ['inicio', 'perfil', 'dashboard', ''];

    // 3. Si el módulo requiere permisos, validar que el usuario tenga al menos nivel 1 (lectura)
    if (modulo && !rutasPublicas.includes(modulo)) {
      if (!authService.tienePermiso(modulo, 1)) {
        router.navigate(['/dashboard/inicio']);
        return false;
      }
    }

    return true;
  }

  router.navigate(['/login']);
  return false;
};