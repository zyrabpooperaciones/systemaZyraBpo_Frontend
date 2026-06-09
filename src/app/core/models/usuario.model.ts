export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  cargo: string;
}

export interface LoginResponse {
  access_token: string;
  usuario: Usuario;
}
