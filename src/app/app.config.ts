import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
// --- MODIFICAMOS LA IMPORTACIÓN DE RED ---
import { provideHttpClient, withInterceptors } from '@angular/common/http';
// --- IMPORTAMOS TU NUEVO INTERCEPTOR ---
import { authInterceptor } from './core/interceptors/auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    // --- CONECTAMOS EL MOTOR HTTP JUNTO CON SU INTERCEPTOR DE SEGURIDAD ---
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};