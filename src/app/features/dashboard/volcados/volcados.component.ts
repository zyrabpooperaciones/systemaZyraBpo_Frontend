import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VolcadosService } from '../../../core/services/volcados/volcados.service';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-volcados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './volcados.component.html',
  styleUrls: ['./volcados.component.css']
})
export class VolcadosComponent {
  private volcadosService = inject(VolcadosService);
  private authService = inject(AuthService);

  tipoVolcado: 'tramos' | 'ivr' = 'tramos';
  
  baseCompleta: File | null = null;
  discador: File | null = null;
  crm: File | null = null;

  estado: 'idle' | 'procesando' | 'exito' | 'error' = 'idle';
  mensajeError: string = '';

  get tienePermisoEjecucion(): boolean {
    return this.authService.tienePermiso('volcados', 2);
  }

  get esValido(): boolean {
    if (!this.tienePermisoEjecucion) return false;
    if (!this.baseCompleta) return false;
    
    if (this.tipoVolcado === 'tramos') {
      return this.discador !== null || this.crm !== null;
    } else {
      return this.discador !== null;
    }
  }

  setTipo(tipo: 'tramos' | 'ivr') {
    this.tipoVolcado = tipo;
    this.limpiarTodo();
  }

  onFileChange(event: any, tipo: 'baseCompleta' | 'discador' | 'crm') {
    const file = event.target.files[0] || null;
    if (tipo === 'baseCompleta') this.baseCompleta = file;
    else if (tipo === 'discador') this.discador = file;
    else if (tipo === 'crm') this.crm = file;
    this.resetEstado();
  }

  eliminarArchivo(tipo: 'baseCompleta' | 'discador' | 'crm', event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (tipo === 'baseCompleta') this.baseCompleta = null;
    else if (tipo === 'discador') this.discador = null;
    else if (tipo === 'crm') this.crm = null;
    this.resetEstado();
  }

  limpiarTodo() {
    this.baseCompleta = null;
    this.discador = null;
    this.crm = null;
    this.resetEstado();
  }

  resetEstado() {
    if (this.estado === 'error' || this.estado === 'exito') {
      this.estado = 'idle';
      this.mensajeError = '';
    }
  }

  ejecutarVolcado() {
    if (!this.esValido) return;

    this.estado = 'procesando';
    this.mensajeError = '';

    const formData = new FormData();
    if (this.baseCompleta) formData.append('base_file', this.baseCompleta);
    if (this.discador) formData.append('discador_file', this.discador);
    if (this.crm) formData.append('crm_file', this.crm);

    const request$ = this.tipoVolcado === 'tramos' 
      ? this.volcadosService.generarVolcadoTramos(formData)
      : this.volcadosService.generarVolcadoIvr(formData);

    request$.subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fecha = new Date().toISOString().split('T')[0];
        a.download = `Volcado_${this.tipoVolcado}_${fecha}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        // Cambiar estado a éxito Y limpiar los archivos automáticamente
        this.estado = 'exito';
        this.baseCompleta = null;
        this.discador = null;
        this.crm = null;
      },
      error: (err: any) => {
        this.estado = 'error';
        this.mensajeError = 'Error al procesar los archivos. Verifica que los formatos de los archivos sean los correctos y coincidan con el tipo de volcado.';
        console.error('Error al generar volcado:', err);
      }
    });
  }
}
