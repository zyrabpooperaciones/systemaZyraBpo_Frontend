export interface Usuario {
  id: number;
  nombre_completo: string;
  email: string;
  rol: string;
  cargo: string;
}

export interface LoginResponse {
  access_token: string;
  usuario: Usuario;
}
