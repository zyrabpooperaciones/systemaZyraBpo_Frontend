import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientesService, ClienteSearchItem, DetalleCliente360Response, CargoClienteDetalle, MovimientoCargoDetalle } from '../../../core/services/clientes/clientes.service';
import { TramosService, Tramo } from '../../../core/services/tramos/tramos.service';
import { ToastService } from '../../../core/services/toast/toast.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  private clientesService = inject(ClientesService);
  private tramosService = inject(TramosService);
  private toastService = inject(ToastService);

  // Filtros de búsqueda
  query: string = '';
  tramoId?: number;
  campanaId?: number;
  estado?: string;

  // Paginación
  limit: number = 15;
  offset: number = 0;
  totalItems: number = 0;
  currentPage: number = 1;

  // Listas de catálogo
  tramos: Tramo[] = [];
  campanas: { id: number; nombre: string }[] = [];
  clientes: ClienteSearchItem[] = [];

  // Ficha detallada 360
  selectedClienteId: number | null = null;
  selectedCliente: DetalleCliente360Response | null = null;
  selectedCargoIdFilter: string = 'ALL';

  // Totales de la ficha detallada
  totalMontoInicial: number = 0;
  totalMontoInteres: number = 0;
  totalMontoGastoAdm: number = 0;
  totalMontoPagado: number = 0;
  totalSaldoCobrar: number = 0;
  totalDescuentoAplicable: number = 0;
  totalMontoParaLiquidar: number = 0;

  // Estados de carga y búsqueda
  loading: boolean = false;
  hasSearched: boolean = false;

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    // Listar tramos activos
    this.tramosService.listarTramos(false).subscribe({
      next: (res) => this.tramos = res,
      error: () => this.toastService.error('Error al cargar la lista de tramos.')
    });

    // Listar campañas registradas
    this.clientesService.listarCampanas().subscribe({
      next: (res) => this.campanas = res,
      error: () => this.toastService.error('Error al cargar la lista de campañas.')
    });
  }

  buscar(): void {
    this.loading = true;
    this.hasSearched = true;
    this.clientesService.buscarClientes({
      query: this.query.trim(),
      tramo_id: this.tramoId,
      campana_id: this.campanaId,
      estado: this.estado,
      limit: this.limit,
      offset: this.offset
    }).subscribe({
      next: (res) => {
        this.clientes = res.items;
        this.totalItems = res.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.error('Error al realizar la búsqueda de clientes.');
      }
    });
  }

  limpiarFiltros(): void {
    this.query = '';
    this.tramoId = undefined;
    this.campanaId = undefined;
    this.estado = undefined;
    this.offset = 0;
    this.currentPage = 1;
    this.clientes = [];
    this.totalItems = 0;
    this.hasSearched = false;
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPaginas) return;
    this.currentPage = nuevaPagina;
    this.offset = (nuevaPagina - 1) * this.limit;
    this.buscar();
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalItems / this.limit) || 1;
  }

  verFicha(clienteId: number): void {
    this.loading = true;
    this.clientesService.obtenerDetalleCliente(clienteId).subscribe({
      next: (res) => {
        this.selectedCliente = res;
        this.selectedClienteId = clienteId;
        this.selectedCargoIdFilter = 'ALL';
        this.calcularTotales();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.error('No se pudo recuperar la información detallada del cliente.');
      }
    });
  }

  volverAlBuscador(): void {
    this.selectedCliente = null;
    this.selectedClienteId = null;
    this.selectedCargoIdFilter = 'ALL';
  }

  get cargosFiltrados(): CargoClienteDetalle[] {
    if (!this.selectedCliente) return [];
    if (this.selectedCargoIdFilter === 'ALL') {
      return this.selectedCliente.cargos;
    }
    return this.selectedCliente.cargos.filter(c => c.numero_cargo === this.selectedCargoIdFilter);
  }

  get movimientosFiltrados(): MovimientoCargoDetalle[] {
    if (!this.selectedCliente) return [];
    if (this.selectedCargoIdFilter === 'ALL') {
      return this.selectedCliente.movimientos;
    }
    return this.selectedCliente.movimientos.filter(m => m.numero_cargo === this.selectedCargoIdFilter);
  }

  onCargoFilterChange(): void {
    this.calcularTotales();
  }

  calcularTotales(): void {
    const filtrados = this.cargosFiltrados;
    this.totalMontoInicial = filtrados.reduce((sum, c) => sum + c.monto_inicial, 0);
    this.totalMontoInteres = filtrados.reduce((sum, c) => sum + c.monto_interes, 0);
    this.totalMontoGastoAdm = filtrados.reduce((sum, c) => sum + c.monto_gasto_adm, 0);
    this.totalMontoPagado = filtrados.reduce((sum, c) => sum + c.monto_pagado, 0);
    this.totalSaldoCobrar = filtrados.reduce((sum, c) => sum + c.saldo_cobrar, 0);
    this.totalDescuentoAplicable = filtrados.reduce((sum, c) => sum + (c.descuento_aplicable || 0), 0);
    this.totalMontoParaLiquidar = filtrados.reduce((sum, c) => sum + (c.monto_para_liquidar || c.saldo_cobrar), 0);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  exportarCSV(): void {
    if (this.clientes.length === 0) {
      this.toastService.warning('No hay datos en pantalla para exportar.');
      return;
    }

    // Cabeceras del CSV
    const headers = [
      'Código Belcor',
      'Nombre Completo',
      'C.I.',
      'Teléfono Marcador',
      'Campañas Activas',
      'Saldo Original (Bs)',
      'Saldo con Descuento (Bs)',
      'Estado'
    ];

    // Mapear filas
    const rows = this.clientes.map(c => [
      c.codigo_cliente_belcor,
      c.nombre_completo,
      c.numero_documento || '',
      c.telefono_principal || '',
      c.campanas_activas.join('; '),
      c.saldo_total_pendiente,
      c.saldo_neto_pendiente,
      c.estado_general
    ]);

    // Generar formato CSV (con BOM para Excel en español)
    let csvContent = '\uFEFF';
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
      const rowEscaped = row.map(val => {
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      });
      csvContent += rowEscaped.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Clientes_Marcador_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.toastService.success('Archivo de exportación generado correctamente.');
  }
}
