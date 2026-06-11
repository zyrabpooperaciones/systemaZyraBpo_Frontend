export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  cargo: string;
  ci: string;
  telefono?: string;
}

export interface LoginResponse {
  access_token: string;
  usuario: Usuario;
}
