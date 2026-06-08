import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URL base apuntando directamente a tu Backend blindado en FastAPI
  private readonly URL_API = 'http://localhost:8000/auth';

  constructor(private http: HttpClient) {}

  // Envía las credenciales a FastAPI. 
  // Si la respuesta es exitosa, guarda el token y el usuario en SessionStorage.
  login(credenciales: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.URL_API}/login`, credenciales).pipe(
      tap(respuesta => {
        if (respuesta && respuesta.access_token) {
          // REGLA DE SEGURIDAD JAIRO: Se almacena en la memoria volátil de la pestaña
          sessionStorage.setItem('zyra_token', respuesta.access_token);
          // Guardamos también los datos del perfil para usarlos en el diseño visual más adelante
          sessionStorage.setItem('zyra_usuario', JSON.stringify(respuesta.usuario));
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
  obtenerUsuarioActual(): any | null {
    const usuarioJson = sessionStorage.getItem('zyra_usuario');
    return usuarioJson ? JSON.parse(usuarioJson) : null;
  }

  // Verifica de forma rápida si el usuario tiene una sesión activa en el cliente
  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  //Destruye el rastro local del token en el navegador
  private limpiarSesionLocal(): void {
    sessionStorage.removeItem('zyra_token');
    sessionStorage.removeItem('zyra_usuario');
  }
}