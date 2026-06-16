import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolesService, Rol, Modulo, Permiso } from '../../../core/services/roles/roles.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import { UsuariosService } from '../../../core/services/usuarios/usuarios.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
  styles: []
})
export class RolesComponent implements OnInit {
  roles: Rol[] = [];
  modulos: Modulo[] = [];
  permisosRol: Permiso[] = [];
  usuariosPorRol: { [rolId: number]: number } = {};

  cargando = false;
  
  // Control de Modales
  modalRolAbierto = false;
  modalPermisosAbierto = false;
  
  // Formulario Rol (Crear / Editar)
  modoEdicion = false;
  idRolEdicion: number | null = null;
  nombreRol = '';
  descripcionRol = '';

  // Rol actualmente seleccionado para configurar permisos
  rolSeleccionado: Rol | null = null;

  constructor(
    private rolesService: RolesService,
    private usuariosService: UsuariosService,
    public authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    
    // Listar Roles
    this.rolesService.listarRoles().subscribe({
      next: (roles: Rol[]) => {
        this.roles = roles;
        this.cargando = false;
        this.calcularUsuariosPorRol();
      },
      error: (err: any) => {
        this.toastService.error('Error al cargar la lista de roles.');
        this.cargando = false;
      }
    });

    // Listar Módulos
    this.rolesService.listarModulos().subscribe({
      next: (modulos: Modulo[]) => {
        this.modulos = modulos;
      },
      error: (err: any) => {
        console.error('Error al cargar módulos:', err);
      }
    });
  }

  calcularUsuariosPorRol(): void {
    if (this.authService.tienePermiso('usuarios', 1)) {
      this.usuariosService.listarUsuarios().subscribe({
        next: (usuarios: any[]) => {
          const conteo: { [rolId: number]: number } = {};
          this.roles.forEach(r => conteo[r.id] = 0);
          
          usuarios.forEach((u: any) => {
            if (conteo[u.rol_id] !== undefined) {
              conteo[u.rol_id]++;
            }
          });
          
          this.usuariosPorRol = conteo;
        },
        error: (err: any) => {
          console.error('Error al cargar conteo de usuarios:', err);
        }
      });
    } else {
      const conteo: { [rolId: number]: number } = {};
      this.roles.forEach(r => conteo[r.id] = 0);
      this.usuariosPorRol = conteo;
    }
  }

  obtenerConteoUsuarios(rolId: number): number {
    return this.usuariosPorRol[rolId] || 0;
  }

  // ============================================================================
  // GESTIÓN DE ROLES (CREAR / EDITAR / ELIMINAR)
  // ============================================================================

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.idRolEdicion = null;
    this.nombreRol = '';
    this.descripcionRol = '';
    this.modalRolAbierto = true;
  }

  abrirModalEditar(rol: Rol): void {
    this.modoEdicion = true;
    this.idRolEdicion = rol.id;
    this.nombreRol = rol.nombre;
    this.descripcionRol = rol.descripcion;
    this.modalRolAbierto = true;
  }

  guardarRol(): void {
    if (!this.nombreRol.trim() || !this.descripcionRol.trim()) {
      this.toastService.warning('Por favor completa todos los campos.');
      return;
    }

    const payload = {
      nombre: this.nombreRol.trim(),
      descripcion: this.descripcionRol.trim()
    };

    this.cargando = true;

    if (this.modoEdicion && this.idRolEdicion !== null) {
      this.rolesService.actualizarRol(this.idRolEdicion, payload).subscribe({
        next: (rolActualizado: Rol) => {
          this.toastService.success('Rol actualizado con éxito 🎉');
          this.cerrarModales();
          this.cargarDatos();
        },
        error: (err: any) => {
          this.toastService.error(err.error?.detail || 'Error al actualizar el rol.');
          this.cargando = false;
        }
      });
    } else {
      this.rolesService.crearRol(payload).subscribe({
        next: (nuevoRol: Rol) => {
          this.toastService.success('Rol creado con éxito 🎉');
          this.cerrarModales();
          this.cargarDatos();
        },
        error: (err: any) => {
          this.toastService.error(err.error?.detail || 'Error al crear el rol.');
          this.cargando = false;
        }
      });
    }
  }

  eliminarRol(id: number): void {
    Swal.fire({
      title: '¿Eliminar este rol?',
      text: 'Esta acción no se puede deshacer y el rol será eliminado permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-5 py-2.5 rounded-xl font-semibold',
        cancelButton: 'px-5 py-2.5 rounded-xl font-semibold'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.cargando = true;
        this.rolesService.eliminarRol(id).subscribe({
          next: (resp: any) => {
            this.toastService.success(resp.mensaje || 'Rol eliminado correctamente 🎉');
            this.cargarDatos();
          },
          error: (err: any) => {
            this.toastService.error(err.error?.detail || 'No se pudo eliminar el rol.');
            this.cargando = false;
          }
        });
      }
    });
  }

  // ============================================================================
  // GESTIÓN DE PERMISOS
  // ============================================================================

  abrirModalConfigurar(rol: Rol): void {
    this.rolSeleccionado = rol;
    this.cargando = true;
    this.rolesService.obtenerPermisosRol(rol.id).subscribe({
      next: (permisos: Permiso[]) => {
        this.permisosRol = permisos;
        this.modalPermisosAbierto = true;
        this.cargando = false;
      },
      error: (err: any) => {
        this.toastService.error('Error al cargar los permisos del rol.');
        this.cargando = false;
      }
    });
  }

  cambiarNivelAcceso(moduloId: number, nivel: number): void {
    const permiso = this.permisosRol.find(p => p.modulo_id === moduloId);
    if (permiso) {
      permiso.nivel_acceso = nivel;
    }
  }

  guardarPermisos(): void {
    if (!this.rolSeleccionado) return;

    this.cargando = true;
    const payload = this.permisosRol.map(p => ({
      modulo_id: p.modulo_id,
      nivel_acceso: p.nivel_acceso
    }));

    this.rolesService.actualizarPermisosRol(this.rolSeleccionado.id, payload).subscribe({
      next: (resp: any) => {
        this.toastService.success('Permisos actualizados con éxito 🎉');
        this.cerrarModales();
      },
      error: (err: any) => {
        this.toastService.error('Error al guardar los permisos.');
        this.cargando = false;
      }
    });
  }

  cerrarModales(): void {
    this.modalRolAbierto = false;
    this.modalPermisosAbierto = false;
    this.rolSeleccionado = null;
    this.permisosRol = [];
    this.nombreRol = '';
    this.descripcionRol = '';
  }
}

