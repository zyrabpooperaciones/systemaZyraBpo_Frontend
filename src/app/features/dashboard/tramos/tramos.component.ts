import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TramosService, Tramo } from '../../../core/services/tramos/tramos.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tramos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tramos.component.html',
  styles: []
})
export class TramosComponent implements OnInit {
  tramos: Tramo[] = [];
  cargando = false;
  mostrarInactivos = false;

  constructor(
    private tramosService: TramosService,
    public authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarTramos();
  }

  cargarTramos(): void {
    this.cargando = true;
    this.tramosService.listarTramos(this.mostrarInactivos).subscribe({
      next: (tramos: Tramo[]) => {
        this.tramos = tramos;
        this.cargando = false;
      },
      error: (err: any) => {
        this.toastService.error('Error al cargar la lista de tramos.');
        this.cargando = false;
      }
    });
  }

  filtrarTramos(verInactivos: boolean): void {
    if (this.mostrarInactivos !== verInactivos) {
      this.mostrarInactivos = verInactivos;
      this.cargarTramos();
    }
  }

  toggleEstado(tramo: Tramo, event: Event): void {
    event.stopPropagation();
    
    if (!this.authService.tienePermiso('configuracion_tramos', 3)) {
      this.toastService.warning('No tienes permisos suficientes para activar/desactivar tramos.');
      const input = event.target as HTMLInputElement;
      input.checked = tramo.activo;
      return;
    }

    const nuevoEstado = !tramo.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';

    Swal.fire({
      title: `¿${nuevoEstado ? 'Activar' : 'Desactivar'} tramo ${tramo.nombre}?`,
      text: nuevoEstado 
        ? 'El tramo volverá a estar disponible para la gestión operativa y carga de archivos.' 
        : 'El tramo se ocultará de los menús activos del sistema, pero se conservarán todos sus datos históricos.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: nuevoEstado ? '#10b981' : '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: nuevoEstado ? 'Sí, activar' : 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-5 py-2.5 rounded-xl font-semibold text-white',
        cancelButton: 'px-5 py-2.5 rounded-xl font-semibold'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.cargando = true;
        this.tramosService.actualizarEstadoTramo(tramo.id, nuevoEstado).subscribe({
          next: (res: Tramo) => {
            this.toastService.success(`Tramo ${tramo.nombre} ${nuevoEstado ? 'activado' : 'desactivado'} con éxito 🎉`);
            this.cargarTramos();
          },
          error: (err: any) => {
            this.toastService.error('Error al actualizar el estado del tramo.');
            this.cargando = false;
            const input = event.target as HTMLInputElement;
            input.checked = tramo.activo;
          }
        });
      } else {
        const input = event.target as HTMLInputElement;
        input.checked = tramo.activo;
      }
    });
  }
}
