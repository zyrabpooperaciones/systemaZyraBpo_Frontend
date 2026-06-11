import { Component, output, signal, HostListener, ElementRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styles: []
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  // Evento para colapsar o expandir el sidebar en pantallas móviles
  toggleSidebar = output<void>();

  // Señal reactiva para el usuario actual
  usuarioActual = this.authService.usuarioActual;

  // Estado del menú desplegable del perfil (dropdown)
  isDropdownOpen = signal(false);

  // Alterna el dropdown de perfil
  toggleDropdown() {
    this.isDropdownOpen.update(val => !val);
  }

  // Cierra el dropdown si se hace click fuera del componente
  @HostListener('document:click', ['$event'])
  clickOut(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen.set(false);
    }
  }

  // Cierra la sesión
  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.toastService.success('Sesión cerrada correctamente. ¡Hasta pronto!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        // En caso de error (ej. token ya inválido), el servicio limpia localmente y redirigimos igual
        this.toastService.warning('Sesión finalizada localmente.');
        this.router.navigate(['/login']);
      }
    });
  }

  // Navega al módulo de perfil
  verPerfil() {
    this.router.navigate(['/dashboard/perfil']);
    this.isDropdownOpen.set(false);
  }

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
}
