import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UsuariosService } from '../../../core/services/usuarios/usuarios.service';
import { RolesService } from '../../../core/services/roles/roles.service';
import { TramosService } from '../../../core/services/tramos/tramos.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.component.html',
  styles: []
})
export class InicioComponent implements OnInit {
  private authService = inject(AuthService);
  private usuariosService = inject(UsuariosService);
  private rolesService = inject(RolesService);
  private tramosService = inject(TramosService);

  usuarioActual = this.authService.usuarioActual;

  // Permisos de visualización para evitar peticiones 403 y alertas globales
  verUsuariosStat = false;
  verRolesStat = false;
  verTramosStat = false;

  // Estadísticas operacionales reales
  totalUsuarios = 0;
  usuariosActivos = 0;
  totalRoles = 0;
  totalTramos = 0;
  tramosActivosCount = 0;
  
  cargando = false;
  fechaActual = new Date();

  ngOnInit() {
    this.verUsuariosStat = this.authService.tienePermiso('usuarios', 1);
    this.verRolesStat = this.authService.tienePermiso('roles', 1);
    this.verTramosStat = this.authService.tienePermiso('configuracion_tramos', 1);

    this.cargarEstadisticasReales();
  }

  cargarEstadisticasReales() {
    this.cargando = true;
    const promesas: Promise<any>[] = [];

    if (this.verUsuariosStat) {
      const p = new Promise((resolve) => {
        this.usuariosService.listarUsuarios().subscribe({
          next: (data) => {
            this.totalUsuarios = data.length;
            // La base de datos guarda 'ACTIVO' en mayúsculas
            this.usuariosActivos = data.filter(u => u.estado?.toUpperCase() === 'ACTIVO').length;
            resolve(true);
          },
          error: () => resolve(false)
        });
      });
      promesas.push(p);
    }

    if (this.verRolesStat) {
      const p = new Promise((resolve) => {
        this.rolesService.listarRoles().subscribe({
          next: (data) => {
            this.totalRoles = data.length;
            resolve(true);
          },
          error: () => resolve(false)
        });
      });
      promesas.push(p);
    }

    if (this.verTramosStat) {
      const p = new Promise((resolve) => {
        this.tramosService.listarTramos(true).subscribe({
          next: (data) => {
            this.totalTramos = data.length;
            this.tramosActivosCount = data.filter(t => t.activo).length;
            resolve(true);
          },
          error: () => resolve(false)
        });
      });
      promesas.push(p);
    }

    if (promesas.length > 0) {
      Promise.all(promesas).then(() => {
        this.cargando = false;
      });
    } else {
      this.cargando = false;
    }
  }

  getSaludo(): string {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
