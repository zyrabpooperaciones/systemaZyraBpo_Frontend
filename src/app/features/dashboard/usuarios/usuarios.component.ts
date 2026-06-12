import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService, UsuarioInfo } from '../../../core/services/usuarios/usuarios.service';
import { RolesService, Rol } from '../../../core/services/roles/roles.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styles: []
})
export class UsuariosComponent implements OnInit {
  usuarios: UsuarioInfo[] = [];
  roles: Rol[] = [];
  usuariosFiltrados: UsuarioInfo[] = [];
  terminoBusqueda = '';

  cargando = false;
  modalUsuarioAbierto = false;
  modoEdicion = false;
  idUsuarioEdicion: number | null = null;

  // Campos del Formulario
  email = '';
  password = '';
  rol_id: number | null = null;
  ci = '';
  nombre = '';
  apellido = '';
  telefono = '';
  cargo = '';
  estado = 'ACTIVO';

  constructor(
    private usuariosService: UsuariosService,
    private rolesService: RolesService,
    public authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.usuariosService.listarUsuarios().subscribe({
      next: (usuarios: UsuarioInfo[]) => {
        this.usuarios = usuarios;
        this.filtrarUsuarios();
        this.cargando = false;
      },
      error: (err: any) => {
        this.toastService.error('Error al cargar los usuarios del sistema.');
        this.cargando = false;
      }
    });

    this.rolesService.listarRoles().subscribe({
      next: (roles: Rol[]) => {
        this.roles = roles;
      },
      error: (err: any) => {
        console.error('Error al cargar la lista de roles:', err);
      }
    });
  }

  filtrarUsuarios(): void {
    const busqueda = this.terminoBusqueda.trim().toLowerCase();
    if (!busqueda) {
      this.usuariosFiltrados = [...this.usuarios];
    } else {
      this.usuariosFiltrados = this.usuarios.filter(u => 
        u.nombre.toLowerCase().includes(busqueda) ||
        u.apellido.toLowerCase().includes(busqueda) ||
        u.email.toLowerCase().includes(busqueda) ||
        (u.cargo || '').toLowerCase().includes(busqueda) ||
        u.rol_nombre.toLowerCase().includes(busqueda) ||
        u.ci.includes(busqueda)
      );
    }
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.idUsuarioEdicion = null;
    this.email = '';
    this.password = '';
    this.rol_id = this.roles.length > 0 ? this.roles[0].id : null;
    this.ci = '';
    this.nombre = '';
    this.apellido = '';
    this.telefono = '';
    this.cargo = '';
    this.estado = 'ACTIVO';
    this.modalUsuarioAbierto = true;
  }

  abrirModalEditar(usuario: UsuarioInfo): void {
    this.modoEdicion = true;
    this.idUsuarioEdicion = usuario.id;
    this.email = usuario.email;
    this.password = ''; // Opcional o no se edita aquí directamente
    this.rol_id = usuario.rol_id;
    this.ci = usuario.ci;
    this.nombre = usuario.nombre;
    this.apellido = usuario.apellido;
    this.telefono = usuario.telefono || '';
    this.cargo = usuario.cargo || '';
    this.estado = usuario.estado;
    this.modalUsuarioAbierto = true;
  }

  cerrarModal(): void {
    this.modalUsuarioAbierto = false;
    this.idUsuarioEdicion = null;
  }

  guardarUsuario(): void {
    if (!this.email.trim() || !this.nombre.trim() || !this.apellido.trim() || !this.ci.trim() || !this.rol_id) {
      this.toastService.warning('Por favor completa los campos requeridos.');
      return;
    }

    if (!this.modoEdicion && (!this.password || this.password.length < 6)) {
      this.toastService.warning('La contraseña es requerida y debe tener al menos 6 caracteres.');
      return;
    }

    this.cargando = true;

    if (this.modoEdicion && this.idUsuarioEdicion !== null) {
      const payload = {
        email: this.email.trim(),
        rol_id: this.rol_id,
        estado: this.estado,
        ci: this.ci.trim(),
        nombre: this.nombre.trim(),
        apellido: this.apellido.trim(),
        telefono: this.telefono.trim() || undefined
      };

      this.usuariosService.actualizarUsuario(this.idUsuarioEdicion, payload).subscribe({
        next: (resp: any) => {
          this.toastService.success('Usuario actualizado correctamente 🎉');
          this.cerrarModal();
          this.cargarDatos();
        },
        error: (err: any) => {
          this.toastService.error(err.error?.detail || 'Error al actualizar el usuario.');
          this.cargando = false;
        }
      });
    } else {
      const payload = {
        email: this.email.trim(),
        password: this.password,
        rol_id: this.rol_id,
        ci: this.ci.trim(),
        nombre: this.nombre.trim(),
        apellido: this.apellido.trim(),
        telefono: this.telefono.trim() || undefined
      };

      this.usuariosService.crearUsuario(payload).subscribe({
        next: (resp: any) => {
          this.toastService.success('Usuario creado correctamente 🎉');
          this.cerrarModal();
          this.cargarDatos();
        },
        error: (err: any) => {
          this.toastService.error(err.error?.detail || 'Error al crear el usuario.');
          this.cargando = false;
        }
      });
    }
  }

  desactivarUsuario(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'El usuario será desactivado y no podrá acceder al sistema.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-5 py-2.5 rounded-xl font-semibold',
        cancelButton: 'px-5 py-2.5 rounded-xl font-semibold'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.cargando = true;
        this.usuariosService.desactivarUsuario(id).subscribe({
          next: (resp: any) => {
            this.toastService.success(resp.mensaje || 'Usuario desactivado correctamente 🎉');
            this.cargarDatos();
          },
          error: (err: any) => {
            this.toastService.error(err.error?.detail || 'Error al desactivar el usuario.');
            this.cargando = false;
          }
        });
      }
    });
  }
}
