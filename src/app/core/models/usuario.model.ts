export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  cargo: string;
  ci: string;
  telefono?: string;
  rol_id?: number;
  rol_nombre?: string;
}

export interface PermisoInfo {
  modulo: string;
  nivel: number;
}

export interface LoginResponse {
  access_token: string;
  usuario: Usuario;
  permisos: PermisoInfo[];
}
