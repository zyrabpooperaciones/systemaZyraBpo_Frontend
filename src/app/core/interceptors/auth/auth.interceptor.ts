import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Inyectamos el servicio de autenticación para leer el token
  const authService = inject(AuthService);
  const token = authService.obtenerToken();

  // Si el usuario tiene un token en sessionStorage, clonamos la petición y le clavamos el Bearer
  if (token) {
    const peticionClonada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Dejamos que la petición clonada con el token siga su camino hacia FastAPI
    return next(peticionClonada);
  }

  // Si no hay token (como en el Login), la petición pasa limpia e intacta
  return next(req);
};