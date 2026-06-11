import { Component, inject, signal, effect } from '@angular/core';
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

  // Estados de edición
  editandoPerfil = signal(false);
  editandoPassword = signal(false);

  // Signals para campos editables y visuales
  nombre = signal('');
  apellido = signal('');
  email = signal('');
  ci = signal('');
  telefono = signal('');

  // Signals para el cambio de contraseña
  passwordActual = signal('');
  nuevaPassword = signal('');
  confirmarPassword = signal('');

  constructor() {
    // Sincronizar campos cuando cambia el usuarioActual
    effect(() => {
      const usuario = this.usuarioActual();
      if (usuario) {
        this.nombre.set(usuario.nombre || '');
        this.apellido.set(usuario.apellido || '');
        this.email.set(usuario.email || '');
        this.ci.set(usuario.ci || '');
        this.telefono.set(usuario.telefono || '');
      }
    });
  }

  // Activa el modo de edición de perfil
  activarEdicion() {
    this.editandoPerfil.set(true);
  }

  // Cancela la edición de perfil y restaura los valores originales
  cancelarEdicion() {
    const usuario = this.usuarioActual();
    if (usuario) {
      this.nombre.set(usuario.nombre || '');
      this.apellido.set(usuario.apellido || '');
      this.telefono.set(usuario.telefono || '');
    }
    this.editandoPerfil.set(false);
  }

  // Guarda los cambios del perfil llamando a FastAPI
  guardarPerfil() {
    if (!this.nombre().trim() || !this.apellido().trim()) {
      this.toastService.error('Por favor, completa los campos obligatorios de nombre y apellido.');
      return;
    }

    const datos = {
      nombre: this.nombre().trim(),
      apellido: this.apellido().trim(),
      telefono: this.telefono().trim() || undefined
    };

    this.authService.actualizarPerfil(datos).subscribe({
      next: (res) => {
        this.toastService.success(res.mensaje || 'Perfil actualizado correctamente 🎉');
        this.editandoPerfil.set(false);
      },
      error: (err) => {
        const errorMsg = err.error?.detail || 'No se pudo actualizar el perfil.';
        this.toastService.error(errorMsg);
      }
    });
  }

  // Activa la sección para cambiar contraseña
  activarCambioPassword() {
    this.editandoPassword.set(true);
  }

  // Cancela la edición de contraseña
  cancelarCambioPassword() {
    this.passwordActual.set('');
    this.nuevaPassword.set('');
    this.confirmarPassword.set('');
    this.editandoPassword.set(false);
  }

  // Cambia la contraseña llamando a FastAPI
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

    const datos = {
      password_actual: this.passwordActual(),
      nueva_password: this.nuevaPassword()
    };

    this.authService.cambiarPassword(datos).subscribe({
      next: (res) => {
        this.toastService.success(res.mensaje || 'Contraseña actualizada correctamente 🎉');
        this.cancelarCambioPassword();
      },
      error: (err) => {
        const errorMsg = err.error?.detail || 'No se pudo cambiar la contraseña. Verifica tu contraseña actual.';
        this.toastService.error(errorMsg);
      }
    });
  }

  // Retorna las iniciales del usuario
  getIniciales(): string {
    const usuario = this.usuarioActual();
    if (!usuario) return 'U';
    const n = usuario.nombre ? usuario.nombre.charAt(0) : '';
    const a = usuario.apellido ? usuario.apellido.charAt(0) : '';
    return (n + a).toUpperCase() || 'U';
  }
}
