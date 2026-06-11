import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Usuario, LoginResponse } from '../../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URL base apuntando dinámicamente al backend según el entorno
  private readonly URL_API = `${environment.apiUrl}/auth`;

  // Signal reactivo para el usuario autenticado
  readonly usuarioActual = signal<Usuario | null>(this.obtenerUsuarioActual());

  constructor(private http: HttpClient) {}

  // Envía las credenciales a FastAPI. 
  // Si la respuesta es exitosa, guarda el token y el usuario en SessionStorage.
  login(credenciales: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.URL_API}/login`, credenciales).pipe(
      tap(respuesta => {
        if (respuesta && respuesta.access_token) {
          // REGLA DE SEGURIDAD JAIRO: Se almacena en la memoria volátil de la pestaña
          sessionStorage.setItem('zyra_token', respuesta.access_token);
          // Guardamos también los datos del perfil para usarlos en el diseño visual más adelante
          sessionStorage.setItem('zyra_usuario', JSON.stringify(respuesta.usuario));
          // Actualizamos la señal reactiva
          this.usuarioActual.set(respuesta.usuario);
        }
      })
    );
  }


  // Elimina el token en Postgres 17 y luego limpia la memoria de la computadora
  logout(): Observable<any> {
    const token = this.obtenerToken();
    
    // Armamos la cabecera idéntica a como lo hicimos en Swagger Docs
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Le avisamos al Backend para que cambie la bandera 'valida' a FALSE
    return this.http.post<any>(`${this.URL_API}/logout`, {}, { headers }).pipe(
      tap({
        next: () => this.limpiarSesionLocal(),
        error: () => this.limpiarSesionLocal() // Si el token ya expiró en el Back, igual limpiamos el navegador
      })
    );
  }

  // Recupera el token guardado en la pestaña actual
  obtenerToken(): string | null {
    return sessionStorage.getItem('zyra_token');
  }

  // Recupera los datos del usuario logueado (nombre, rol, cargo)
  obtenerUsuarioActual(): Usuario | null {
    const usuarioJson = sessionStorage.getItem('zyra_usuario');
    return usuarioJson ? JSON.parse(usuarioJson) as Usuario : null;
  }

  // Verifica de forma rápida si el usuario tiene una sesión activa en el cliente
  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  /**
   * Actualiza el perfil del usuario activo (Nombre y teléfono)
   */
  actualizarPerfil(datos: { nombre: string; apellido: string; telefono?: string }): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/auth/perfil`, datos).pipe(
      tap(respuesta => {
        if (respuesta && respuesta.usuario) {
          sessionStorage.setItem('zyra_usuario', JSON.stringify(respuesta.usuario));
          this.usuarioActual.set(respuesta.usuario);
        }
      })
    );
  }

  /**
   * Cambia la contraseña del usuario activo
   */
  cambiarPassword(datos: { password_actual: string; nueva_password: string }): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/auth/cambiar-password`, datos);
  }

  // ============================================================================
  // NUEVOS MÉTODOS DE RECUPERACIÓN Y RESTABLECIMIENTO (CONECTADOS A FASTAPI)
  // ============================================================================

  /**
   * Dispara el correo institucional a FastAPI para generar el token temporal de 15 minutos
   */
  solicitarRecuperacion(email: string): Observable<any> {
    return this.http.post<any>(`${this.URL_API}/recuperar-password`, { email });
  }

  /**
   * Envía el token original y la nueva contraseña para reescribir las credenciales en Postgres 17
   */
  restablecerPassword(datos: { token: string; nueva_password: string }): Observable<any> {
    return this.http.post<any>(`${this.URL_API}/restablecer-password`, datos);
  }

  //Destruye el rastro local del token en el navegador
  private limpiarSesionLocal(): void {
    sessionStorage.removeItem('zyra_token');
    sessionStorage.removeItem('zyra_usuario');
    this.usuarioActual.set(null);
  }
}