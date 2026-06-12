import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Modulo {
  id: number;
  nombre_interno: string;
  nombre_pantalla: string;
  descripcion: string;
}

export interface Permiso {
  modulo_id: number;
  nombre_interno: string;
  nombre_pantalla: string;
  nivel_acceso: number;
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private readonly URL_API = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  listarRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.URL_API);
  }

  crearRol(rol: { nombre: string; descripcion: string }): Observable<Rol> {
    return this.http.post<Rol>(this.URL_API, rol);
  }

  actualizarRol(id: number, rol: { nombre: string; descripcion: string }): Observable<Rol> {
    return this.http.put<Rol>(`${this.URL_API}/${id}`, rol);
  }

  eliminarRol(id: number): Observable<any> {
    return this.http.delete<any>(`${this.URL_API}/${id}`);
  }

  listarModulos(): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(`${this.URL_API}/modulos`);
  }

  obtenerPermisosRol(rolId: number): Observable<Permiso[]> {
    return this.http.get<Permiso[]>(`${this.URL_API}/${rolId}/permisos`);
  }

  actualizarPermisosRol(rolId: number, permisos: { modulo_id: number; nivel_acceso: number }[]): Observable<any> {
    return this.http.put<any>(`${this.URL_API}/${rolId}/permisos`, { permisos });
  }
}
