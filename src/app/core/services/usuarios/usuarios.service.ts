import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface UsuarioInfo {
  id: number;
  email: string;
  estado: string;
  rol_id: number;
  rol_nombre: string;
  nombre: string;
  apellido: string;
  ci: string;
  telefono?: string;
  cargo?: string;
}

export interface UsuarioCreateData {
  email: string;
  password?: string;
  rol_id: number;
  ci: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  cargo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private readonly URL_API = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  listarUsuarios(): Observable<UsuarioInfo[]> {
    return this.http.get<UsuarioInfo[]>(this.URL_API);
  }

  crearUsuario(usuario: UsuarioCreateData): Observable<UsuarioInfo> {
    return this.http.post<UsuarioInfo>(this.URL_API, usuario);
  }

  actualizarUsuario(id: number, usuario: any): Observable<UsuarioInfo> {
    return this.http.put<UsuarioInfo>(`${this.URL_API}/${id}`, usuario);
  }

  desactivarUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.URL_API}/${id}`);
  }
}
