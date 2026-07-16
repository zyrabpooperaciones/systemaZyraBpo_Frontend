import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TramosService, Tramo, Columna, Telefono, Plantilla, PlantillaDetail } from '../../../../core/services/tramos/tramos.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-tramo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './detalle-tramo.component.html',
  styles: []
})
export class DetalleTramoComponent implements OnInit {
  tramoId!: number;
  tramo: Tramo | null = null;
  cargando = false;
  modoEdicion = false;

  // Tabs principales: 'catalogo' | 'plantillas'
  pestanaActiva = 'catalogo';

  // Sub-tabs de catálogo: 'datos' | 'montos' | 'telefonos'
  subPestanaActiva = 'datos';

  // Catálogos locales para edición
  columnasCatalogo: Columna[] = [];
  telefonosCatalogo: Telefono[] = [];

  // Plantillas
  plantillas: Plantilla[] = [];
  filtroTipoPlantilla = 'TODAS'; // 'TODAS' | 'BASE_ORIGINAL' | 'BASE_ACTUALIZACION' | 'BASE_SALDOS'
  modalPlantillaAbierto = false;
  nombreNuevaPlantilla = '';
  tipoProcesoNuevaPlantilla = 'BASE_ORIGINAL';
  copiarDesdePlantillaId: number | null = null;

  // Edición de Mapeos de una Plantilla específica
  drawerMapeoAbierto = false;
  plantillaEnEdicion: PlantillaDetail | null = null;

  // Checkboxes del mapeo actual
  columnasMapeadasIds: number[] = [];
  telefonosMapeadosIds: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tramosService: TramosService,
    public authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.toastService.error('ID de tramo no válido.');
      this.router.navigate(['/dashboard/tramos']);
      return;
    }
    this.tramoId = Number(idParam);
    this.cargarDatosTramo();
  }

  cargarDatosTramo(): void {
    this.cargando = true;

    // Obtener información del tramo directamente por su ID
    this.tramosService.obtenerTramo(this.tramoId).subscribe({
      next: (tramo: Tramo) => {
        this.tramo = tramo;
        this.cargarCatalogos();
        this.cargarPlantillas();
      },
      error: () => {
        this.toastService.error('El tramo solicitado no existe.');
        this.router.navigate(['/dashboard/tramos']);
        this.cargando = false;
      }
    });
  }

  cargarCatalogos(): void {
    // Cargar columnas
    this.tramosService.obtenerColumnas(this.tramoId).subscribe({
      next: (columnas) => {
        // Clonar para evitar mutación directa
        this.columnasCatalogo = JSON.parse(JSON.stringify(columnas));
      },
      error: () => this.toastService.error('Error al cargar catálogo de columnas.')
    });

    // Cargar teléfonos
    this.tramosService.obtenerTelefonos(this.tramoId).subscribe({
      next: (telefonos) => {
        // Clonar y ordenar por prioridad de menor a mayor
        this.telefonosCatalogo = JSON.parse(JSON.stringify(telefonos)).sort((a: Telefono, b: Telefono) => a.prioridad - b.prioridad);
        this.cargando = false;
      },
      error: () => {
        this.toastService.error('Error al cargar catálogo de teléfonos.');
        this.cargando = false;
      }
    });
  }

  cargarPlantillas(): void {
    this.tramosService.listarPlantillas(this.tramoId).subscribe({
      next: (plantillas) => {
        this.plantillas = plantillas;
      },
      error: () => this.toastService.error('Error al cargar las plantillas del tramo.')
    });
  }

  // ============================================================================
  // FILTROS DE VISTA (CATÁLOGO)
  // ============================================================================

  obtenerColumnasFiltradas(tipo: 'DATO' | 'MONTO'): Columna[] {
    return this.columnasCatalogo.filter(c => c.tipo_campo === tipo);
  }

  // ============================================================================
  // GUARDAR CATÁLOGOS (INVENTARIO GENERAL)
  // ============================================================================

  guardarCatalogos(): void {
    if (!this.authService.tienePermiso('configuracion_tramos', 2)) {
      this.toastService.warning('No tienes permisos para modificar el catálogo.');
      return;
    }

    this.cargando = true;
    
    // Ordenar los teléfonos por prioridad antes de guardarlos
    this.telefonosCatalogo.sort((a, b) => a.prioridad - b.prioridad);
    
    // Guardar columnas
    this.tramosService.guardarColumnas(this.tramoId, this.columnasCatalogo).subscribe({
      next: (columnasActualizadas) => {
        // Guardar teléfonos
        this.tramosService.guardarTelefonos(this.tramoId, this.telefonosCatalogo).subscribe({
          next: (telefonosActualizados) => {
            this.toastService.success('Catálogo del tramo guardado con éxito 🎉');
            this.modoEdicion = false;
            this.cargarCatalogos();
          },
          error: () => {
            this.toastService.error('Error al guardar las prioridades de teléfonos.');
            this.cargando = false;
          }
        });
      },
      error: () => {
        this.toastService.error('Error al guardar el mapeo de columnas.');
        this.cargando = false;
      }
    });
  }

  habilitarEdicion(): void {
    this.modoEdicion = true;
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.cargarCatalogos();
  }

  // ============================================================================
  // GESTIÓN DE PLANTILLAS
  // ============================================================================

  abrirModalNuevaPlantilla(): void {
    this.nombreNuevaPlantilla = '';
    this.tipoProcesoNuevaPlantilla = 'BASE_ORIGINAL';
    this.copiarDesdePlantillaId = null;
    this.modalPlantillaAbierto = true;
  }

  crearPlantilla(): void {
    if (!this.nombreNuevaPlantilla.trim()) {
      this.toastService.warning('Por favor ingresa un nombre para la plantilla.');
      return;
    }

    this.cargando = true;
    const payload = {
      nombre: this.nombreNuevaPlantilla.trim(),
      tipo_proceso: this.tipoProcesoNuevaPlantilla,
      copiar_desde_plantilla_id: this.copiarDesdePlantillaId
    };

    this.tramosService.crearPlantilla(this.tramoId, payload).subscribe({
      next: (nuevaPlantilla) => {
        this.toastService.success('Plantilla creada correctamente 🎉');
        this.modalPlantillaAbierto = false;
        this.cargarPlantillas();
        // Abrir mapeo de la nueva plantilla de inmediato
        this.abrirConfigurarMapeo(nuevaPlantilla.id);
      },
      error: (err) => {
        this.toastService.error(err.error?.detail || 'Error al crear la plantilla.');
        this.cargando = false;
      }
    });
  }

  obtenerPlantillasFiltradas(): Plantilla[] {
    if (this.filtroTipoPlantilla === 'TODAS') {
      return this.plantillas;
    }
    return this.plantillas.filter(p => p.tipo_proceso === this.filtroTipoPlantilla);
  }

  eliminarPlantilla(plantilla: Plantilla, event: Event): void {
    event.stopPropagation();

    if (!this.authService.tienePermiso('configuracion_tramos', 3)) {
      this.toastService.warning('No tienes permisos suficientes para eliminar plantillas.');
      return;
    }

    Swal.fire({
      title: '¿Eliminar plantilla?',
      text: `Esta acción eliminará permanentemente la plantilla "${plantilla.nombre}" y todos sus mapeos de asociación, sin alterar el catálogo general de columnas.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-5 py-2.5 rounded-xl font-semibold text-white',
        cancelButton: 'px-5 py-2.5 rounded-xl font-semibold'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.cargando = true;
        this.tramosService.eliminarPlantilla(plantilla.id).subscribe({
          next: () => {
            this.toastService.success('Plantilla eliminada con éxito 🎉');
            if (this.plantillaEnEdicion?.id === plantilla.id) {
              this.drawerMapeoAbierto = false;
            }
            this.cargarPlantillas();
            this.cargando = false;
          },
          error: () => {
            this.toastService.error('Error al intentar eliminar la plantilla.');
            this.cargando = false;
          }
        });
      }
    });
  }

  // ============================================================================
  // CONFIGURAR CHECKBOXES DE MAPEO (PLANTILLAS MANY-TO-MANY)
  // ============================================================================

  abrirConfigurarMapeo(plantillaId: number): void {
    this.cargando = true;
    this.tramosService.obtenerPlantilla(plantillaId).subscribe({
      next: (plantilla: PlantillaDetail) => {
        this.plantillaEnEdicion = plantilla;
        
        // Cargar los IDs de las columnas y teléfonos actualmente asociados
        this.columnasMapeadasIds = plantilla.columnas.map(c => c.id as number);
        this.telefonosMapeadosIds = plantilla.telefonos.map(t => t.id as number);
        
        this.drawerMapeoAbierto = true;
        this.cargando = false;
      },
      error: () => {
        this.toastService.error('Error al cargar la configuración de la plantilla.');
        this.cargando = false;
      }
    });
  }

  // Filtros especiales para el builder de plantillas: ¡SOLO COLUMNAS ACTIVAS!
  obtenerColumnasActivas(tipo: 'DATO' | 'MONTO'): Columna[] {
    return this.columnasCatalogo.filter(c => c.tipo_campo === tipo && c.activo);
  }

  obtenerTelefonosActivos(): Telefono[] {
    return this.telefonosCatalogo.filter(t => t.activo);
  }

  // Controladores de selección de checkboxes
  estaColumnaSeleccionada(id: number): boolean {
    return this.columnasMapeadasIds.includes(id);
  }

  toggleColumnaSeleccionada(id: number): void {
    const index = this.columnasMapeadasIds.indexOf(id);
    if (index > -1) {
      this.columnasMapeadasIds.splice(index, 1);
    } else {
      this.columnasMapeadasIds.push(id);
    }
  }

  estaTelefonoSeleccionado(id: number): boolean {
    return this.telefonosMapeadosIds.includes(id);
  }

  toggleTelefonoSeleccionado(id: number): void {
    const index = this.telefonosMapeadosIds.indexOf(id);
    if (index > -1) {
      this.telefonosMapeadosIds.splice(index, 1);
    } else {
      this.telefonosMapeadosIds.push(id);
    }
  }

  guardarMapeo(): void {
    if (!this.plantillaEnEdicion) return;

    this.cargando = true;
    const payload = {
      columnas_ids: this.columnasMapeadasIds,
      telefonos_ids: this.telefonosMapeadosIds
    };

    this.tramosService.actualizarAsociaciones(this.plantillaEnEdicion.id, payload).subscribe({
      next: (plantillaActualizada) => {
        this.toastService.success('Configuración de plantilla guardada con éxito 🎉');
        this.drawerMapeoAbierto = false;
        this.plantillaEnEdicion = null;
        this.cargando = false;
      },
      error: () => {
        this.toastService.error('Error al guardar la asociación de columnas.');
        this.cargando = false;
      }
    });
  }

  cerrarDrawer(): void {
    this.drawerMapeoAbierto = false;
    this.plantillaEnEdicion = null;
  }
}
