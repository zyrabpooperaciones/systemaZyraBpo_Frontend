import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.component.html',
  styles: []
})
export class InicioComponent {
  private authService = inject(AuthService);

  usuarioActual = this.authService.usuarioActual;

  tarjetasModulos = [
    {
      titulo: 'Gestionar Usuarios',
      descripcion: 'Administra las cuentas de usuario, asigna correos corporativos y controla sus datos de acceso.',
      link: '/dashboard/usuarios',
      colorClase: 'from-blue-500 to-indigo-600 shadow-blue-500/10',
      iconSvg: `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`
    },
    {
      titulo: 'Gestionar Roles',
      descripcion: 'Define y audita permisos específicos para cada cargo operacional de la empresa.',
      link: '/dashboard/roles',
      colorClase: 'from-orange-500 to-amber-500 shadow-orange-500/10',
      iconSvg: `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`
    },
    {
      titulo: 'Generar Volcados',
      descripcion: 'Descarga copias de seguridad locales y exporta información clave en formatos compatibles.',
      link: '/dashboard/volcados',
      colorClase: 'from-emerald-500 to-teal-600 shadow-emerald-500/10',
      iconSvg: `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>`
    }
  ];

  // Obtiene un saludo amigable dependiendo de la hora actual
  getSaludo(): string {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
