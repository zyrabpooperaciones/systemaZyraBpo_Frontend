import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/toast/toast.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styles: []
})
export class PerfilComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  // Cargamos los datos actuales de forma reactiva
  usuarioActual = this.authService.usuarioActual;

  // Signals para campos editables del perfil
  nombre = signal(this.usuarioActual()?.nombre_completo || '');
  email = signal(this.usuarioActual()?.email || '');

  // Signals para el cambio de contraseña
  passwordActual = signal('');
  nuevaPassword = signal('');
  confirmarPassword = signal('');

  // Retorna las iniciales del usuario
  getIniciales(): string {
    const usuario = this.usuarioActual();
    if (!usuario || !usuario.nombre_completo) return 'U';
    const partes = usuario.nombre_completo.split(' ');
    if (partes.length >= 2) {
      return (partes[0].charAt(0) + partes[1].charAt(0)).toUpperCase();
    }
    return partes[0].charAt(0).toUpperCase();
  }

  // Simula guardar los cambios del perfil
  guardarPerfil() {
    if (!this.nombre().trim() || !this.email().trim()) {
      this.toastService.error('Por favor, completa los campos de nombre y correo.');
      return;
    }

    // Simulamos éxito en esta fase
    this.toastService.success('Cambios guardados localmente. Conexión con PostgreSQL en la siguiente fase.');
  }

  // Simula cambiar la contraseña
  guardarPassword() {
    if (!this.passwordActual() || !this.nuevaPassword() || !this.confirmarPassword()) {
      this.toastService.error('Todos los campos de contraseña son requeridos.');
      return;
    }

    if (this.nuevaPassword().length < 6) {
      this.toastService.error('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (this.nuevaPassword() !== this.confirmarPassword()) {
      this.toastService.error('La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    // Simulamos éxito en esta fase
    this.toastService.success('Contraseña actualizada. Cambios aplicados encriptados.');
    
    // Limpiamos los campos del formulario
    this.passwordActual.set('');
    this.nuevaPassword.set('');
    this.confirmarPassword.set('');
  }
}
