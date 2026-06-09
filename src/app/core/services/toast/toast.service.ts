import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  mensaje: string;
  tipo: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Signal reactivo para manejar la lista de notificaciones activas en pantalla
  toasts = signal<Toast[]>([]);

  mostrar(mensaje: string, tipo: 'success' | 'error' | 'info' | 'warning' = 'info', duracion = 5000): void {
    const id = Date.now() + Math.random();
    const nuevoToast: Toast = { id, mensaje, tipo };
    
    // Insertamos el nuevo toast
    this.toasts.update(lista => [...lista, nuevoToast]);

    // Temporizador para removerlo de forma automática
    setTimeout(() => {
      this.remover(id);
    }, duracion);
  }

  success(mensaje: string, duracion?: number): void {
    this.mostrar(mensaje, 'success', duracion);
  }

  error(mensaje: string, duracion?: number): void {
    this.mostrar(mensaje, 'error', duracion);
  }

  info(mensaje: string, duracion?: number): void {
    this.mostrar(mensaje, 'info', duracion);
  }

  warning(mensaje: string, duracion?: number): void {
    this.mostrar(mensaje, 'warning', duracion);
  }

  remover(id: number): void {
    this.toasts.update(lista => lista.filter(t => t.id !== id));
  }
}
