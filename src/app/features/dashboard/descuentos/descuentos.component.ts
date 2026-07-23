import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DescuentosService, DescuentoConfig } from '../../../core/services/descuentos/descuentos.service';
import { TramosService, Tramo } from '../../../core/services/tramos/tramos.service';
import { ToastService } from '../../../core/services/toast/toast.service';

@Component({
  selector: 'app-descuentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './descuentos.component.html',
  styleUrls: ['./descuentos.component.css']
})
export class DescuentosComponent implements OnInit {
  private descuentosService = inject(DescuentosService);
  private tramosService = inject(TramosService);
  private toastService = inject(ToastService);

  // Tab activo ('activos' | 'inactivos')
  activeTab: 'activos' | 'inactivos' = 'activos';

  // Catálogos
  tramos: Tramo[] = [];
  
  // Listas de opciones cargadas dinámicamente según deudores con deuda activa
  campanasDisponibles: string[] = [];
  departamentosDisponibles: string[] = [];
  perfilesRiesgoDisponibles: string[] = [];
  segmentosRollingDisponibles: string[] = [];

  // Selección de Cartera/Tramo
  selectedTramo: Tramo | null = null;
  descuentos: DescuentoConfig[] = [];
  loading: boolean = false;

  // Formulario y Modal
  showModal: boolean = false;
  nombre: string = '';
  descuentoMontoFijo: number = 0;
  pctDescuentoCapital: number = 0;
  pctDescuentoInteres: number = 0;
  pctDescuentoGasto: number = 0;
  
  // Habilitadores de Filtros (Switches)
  filterByCampana: boolean = false;
  filterByDepartamento: boolean = false;
  filterByPerfilRiesgo: boolean = false;
  filterBySegmentoRolling: boolean = false;

  // Filtros seleccionados
  campanasFiltro: string[] = [];
  departamentosFiltro: string[] = [];
  perfilesRiesgoFiltro: string[] = [];
  segmentosRollingFiltro: string[] = [];

  ngOnInit(): void {
    this.cargarTramos();
  }

  cargarTramos(): void {
    this.tramosService.listarTramos(false).subscribe({
      next: (res: Tramo[]) => this.tramos = res,
      error: () => this.toastService.error('Error al cargar la lista de carteras.')
    });
  }

  seleccionarTramo(tramo: Tramo): void {
    this.selectedTramo = tramo;
    this.cargarDescuentos();
    this.cargarCatalogosFiltrados();
  }

  deseleccionarTramo(): void {
    this.selectedTramo = null;
    this.descuentos = [];
    this.activeTab = 'activos';
  }

  cargarDescuentos(): void {
    if (!this.selectedTramo) return;
    this.loading = true;
    this.descuentosService.listarDescuentosTramo(this.selectedTramo.id).subscribe({
      next: (res: DescuentoConfig[]) => {
        this.descuentos = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.error('Error al recuperar los descuentos.');
      }
    });
  }

  cargarCatalogosFiltrados(): void {
    if (!this.selectedTramo) return;
    this.descuentosService.obtenerCatalogosFiltrados(this.selectedTramo.id).subscribe({
      next: (res: { campanas: string[]; departamentos: string[]; perfiles_riesgo: string[]; segmentos_rolling: string[] }) => {
        this.campanasDisponibles = res.campanas;
        this.departamentosDisponibles = res.departamentos;
        this.perfilesRiesgoDisponibles = res.perfiles_riesgo;
        this.segmentosRollingDisponibles = res.segmentos_rolling;
      },
      error: () => {
        this.toastService.error('Error al cargar filtros dinámicos basados en deudores activos.');
      }
    });
  }

  // Filtrado rápido en Frontend para las listas segmentadas por pestaña
  get descuentosFiltrados(): DescuentoConfig[] {
    const isActivoTarget = this.activeTab === 'activos';
    return this.descuentos.filter(d => !!d.activo === isActivoTarget);
  }

  get totalActivos(): number {
    return this.descuentos.filter(d => d.activo).length;
  }

  get totalInactivos(): number {
    return this.descuentos.filter(d => !d.activo).length;
  }

  abrirModal(): void {
    this.nombre = '';
    this.descuentoMontoFijo = 0;
    this.pctDescuentoCapital = 0;
    this.pctDescuentoInteres = 0;
    this.pctDescuentoGasto = 0;
    
    // Resetear switches
    this.filterByCampana = false;
    this.filterByDepartamento = false;
    this.filterByPerfilRiesgo = false;
    this.filterBySegmentoRolling = false;

    // Resetear arrays
    this.campanasFiltro = [];
    this.departamentosFiltro = [];
    this.perfilesRiesgoFiltro = [];
    this.segmentosRollingFiltro = [];

    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
  }

  toggleFiltroCampana(nombre: string): void {
    const idx = this.campanasFiltro.indexOf(nombre);
    if (idx > -1) {
      this.campanasFiltro.splice(idx, 1);
    } else {
      this.campanasFiltro.push(nombre);
    }
  }

  toggleFiltroDepto(nombre: string): void {
    const idx = this.departamentosFiltro.indexOf(nombre);
    if (idx > -1) {
      this.departamentosFiltro.splice(idx, 1);
    } else {
      this.departamentosFiltro.push(nombre);
    }
  }

  toggleFiltroPerfil(nombre: string): void {
    const idx = this.perfilesRiesgoFiltro.indexOf(nombre);
    if (idx > -1) {
      this.perfilesRiesgoFiltro.splice(idx, 1);
    } else {
      this.perfilesRiesgoFiltro.push(nombre);
    }
  }

  toggleFiltroRolling(nombre: string): void {
    const idx = this.segmentosRollingFiltro.indexOf(nombre);
    if (idx > -1) {
      this.segmentosRollingFiltro.splice(idx, 1);
    } else {
      this.segmentosRollingFiltro.push(nombre);
    }
  }

  guardarDescuento(): void {
    if (!this.selectedTramo) return;
    if (!this.nombre.trim()) {
      this.toastService.warning('Por favor, introduce un nombre para el descuento.');
      return;
    }

    // Validaciones estrictas de montos
    if (this.descuentoMontoFijo < 0) {
      this.toastService.warning('El monto fijo de descuento no puede ser negativo.');
      return;
    }

    // Validar limites de porcentaje
    if (this.pctDescuentoCapital < 0 || this.pctDescuentoCapital > 100) {
      this.toastService.warning('El porcentaje de descuento de capital debe estar entre 0% y 100%.');
      return;
    }
    if (this.pctDescuentoInteres < 0 || this.pctDescuentoInteres > 100) {
      this.toastService.warning('El porcentaje de descuento de intereses debe estar entre 0% y 100%.');
      return;
    }
    if (this.pctDescuentoGasto < 0 || this.pctDescuentoGasto > 100) {
      this.toastService.warning('El porcentaje de descuento de gastos debe estar entre 0% y 100%.');
      return;
    }

    if (
      this.descuentoMontoFijo <= 0 &&
      this.pctDescuentoCapital <= 0 &&
      this.pctDescuentoInteres <= 0 &&
      this.pctDescuentoGasto <= 0
    ) {
      this.toastService.warning('Debes configurar al menos un valor de descuento superior a cero.');
      return;
    }

    // Validar filtros activos vacíos
    if (this.filterByCampana && this.campanasFiltro.length === 0) {
      this.toastService.warning('Marcaste filtrar por Campaña pero no seleccionaste ninguna.');
      return;
    }
    if (this.filterByDepartamento && this.departamentosFiltro.length === 0) {
      this.toastService.warning('Marcaste filtrar por Departamento pero no seleccionaste ninguno.');
      return;
    }
    if (this.filterByPerfilRiesgo && this.perfilesRiesgoFiltro.length === 0) {
      this.toastService.warning('Marcaste filtrar por Perfil de Riesgo pero no seleccionaste ninguno.');
      return;
    }
    if (this.filterBySegmentoRolling && this.segmentosRollingFiltro.length === 0) {
      this.toastService.warning('Marcaste filtrar por Segmento Rolling pero no seleccionaste ninguno.');
      return;
    }

    const payload: DescuentoConfig = {
      tramo_id: this.selectedTramo.id,
      nombre: this.nombre.trim(),
      descuento_monto_fijo: this.descuentoMontoFijo,
      pct_descuento_capital: this.pctDescuentoCapital,
      pct_descuento_interes: this.pctDescuentoInteres,
      pct_descuento_gasto: this.pctDescuentoGasto,
      campanas: this.filterByCampana ? this.campanasFiltro : [],
      departamentos: this.filterByDepartamento ? this.departamentosFiltro : [],
      perfiles_riesgo: this.filterByPerfilRiesgo ? this.perfilesRiesgoFiltro : [],
      segmentos_rolling: this.filterBySegmentoRolling ? this.segmentosRollingFiltro : []
    };

    this.descuentosService.crearDescuento(payload).subscribe({
      next: () => {
        this.toastService.success('Descuento guardado con éxito.');
        this.cerrarModal();
        this.cargarDescuentos();
        this.cargarCatalogosFiltrados(); // Recargar filtros dinámicos
      },
      error: (err: any) => {
        const msg = err.error?.detail || 'Error al guardar el descuento.';
        this.toastService.error(msg);
      }
    });
  }

  desactivarDescuento(desc: DescuentoConfig): void {
    if (!desc.id) return;
    
    // Alerta de confirmación premium estilizada
    const confirmacion = confirm(
      `¿Estás seguro de desactivar el descuento "${desc.nombre}"?\n\n` +
      `Esta acción restablecerá el saldo a cobrar original para todos los deudores activos de este tramo. ` +
      `Los descuentos ya liquidados no serán afectados.\n\n` +
      `Esta operación no se puede deshacer.`
    );

    if (confirmacion) {
      this.descuentosService.desactivarDescuento(desc.id).subscribe({
        next: () => {
          this.toastService.success('Descuento desactivado correctamente.');
          this.cargarDescuentos();
        },
        error: () => this.toastService.error('Error al desactivar el descuento.')
      });
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value);
  }
}
