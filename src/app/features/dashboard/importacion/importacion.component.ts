import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TramosService, Plantilla } from '../../../core/services/tramos/tramos.service';
import { 
  ImportacionService, 
  ValidationErrorDetail, 
  ImportSummaryResponse, 
  TramoActivoResponse, 
  HistorialImportacionResponse 
} from '../../../core/services/importacion/importacion.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-importacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './importacion.component.html',
  styleUrls: ['./importacion.component.css']
})
export class ImportacionComponent implements OnInit {
  // Estado Principal
  tramosActivos: TramoActivoResponse[] = [];
  tramoSeleccionado: TramoActivoResponse | null = null;
  tramoSeleccionadoId: number | null = null;

  // Workspace de Carga
  plantillas: Plantilla[] = [];
  tipoSubidaFiltro: string | null = null;
  plantillaSeleccionadaId: number | null = null;
  plantillaSeleccionada: Plantilla | null = null;

  archivoSeleccionado: File | null = null;
  dragOver = false;
  cargando = false;

  // Validaciones
  erroresValidacion: ValidationErrorDetail[] = [];
  archivoValido = false;

  // Ingesta Masiva / Stepper
  pasoActual = 1; // 1 = Selección de tramo / Workspace, 2 = Drag & Drop / Validar, 3 = Carga / KPIs
  cargandoProgreso = false;
  porcentajeProgreso = 0;
  resumenCarga: ImportSummaryResponse | null = null;

  // Historial de Auditoría
  historialCargas: HistorialImportacionResponse[] = [];
  pestanaHistorialActiva: 'BASE_ORIGINAL' | 'BASE_ACTUALIZACION' | 'BASE_SALDOS' = 'BASE_ORIGINAL';

  // Modal de Auditoría Individual
  modalAuditoriaAbierto = false;
  cargaAuditoriaSeleccionada: HistorialImportacionResponse | null = null;

  constructor(
    private tramosService: TramosService,
    private importacionService: ImportacionService,
    public authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarTramosActivos();
  }

  // --- OBTENER TRAMOS ACTIVOS ---
  cargarTramosActivos(): void {
    this.cargando = true;
    this.importacionService.obtenerTramosActivos().subscribe({
      next: (tramos) => {
        this.tramosActivos = tramos;
        this.cargando = false;
      },
      error: () => {
        this.toastService.error('Error al cargar la lista de carteras activas.');
        this.cargando = false;
      }
    });
  }

  // --- SELECCIONAR TRAMO ---
  seleccionarTramo(tramo: TramoActivoResponse): void {
    this.tramoSeleccionado = tramo;
    this.tramoSeleccionadoId = tramo.id;
    this.cargarPlantillasDelTramo();
    this.cargarHistorial();
  }

  // --- REGRESAR A SELECCIÓN DE TRAMOS ---
  deseleccionarTramo(): void {
    this.tramoSeleccionado = null;
    this.tramoSeleccionadoId = null;
    this.plantillas = [];
    this.tipoSubidaFiltro = null;
    this.plantillaSeleccionadaId = null;
    this.plantillaSeleccionada = null;
    this.archivoSeleccionado = null;
    this.archivoValido = false;
    this.erroresValidacion = [];
    this.historialCargas = [];
    this.resumenCarga = null;
    this.porcentajeProgreso = 0;
    this.pasoActual = 1;
  }

  // --- CARGAR PLANTILLAS DEL TRAMO ---
  cargarPlantillasDelTramo(): void {
    if (!this.tramoSeleccionadoId) return;
    this.cargando = true;
    this.tramosService.listarPlantillas(this.tramoSeleccionadoId).subscribe({
      next: (plantillas) => {
        this.plantillas = plantillas.filter(p => p.activo);
        this.cargando = false;
      },
      error: () => {
        this.toastService.error('Error al cargar las plantillas de la cartera.');
        this.cargando = false;
      }
    });
  }

  // --- CARGAR HISTORIAL DE IMPORTACIONES ---
  cargarHistorial(): void {
    if (!this.tramoSeleccionadoId) return;
    this.importacionService.obtenerHistorial(this.tramoSeleccionadoId).subscribe({
      next: (historial) => {
        this.historialCargas = historial;
      },
      error: () => {
        this.toastService.error('Error al cargar el historial de importaciones.');
      }
    });
  }

  // --- CAMBIO DE TIPO DE SUBIDA ---
  onTipoSubidaChange(): void {
    this.plantillaSeleccionadaId = null;
    this.plantillaSeleccionada = null;
    this.archivoSeleccionado = null;
    this.archivoValido = false;
    this.erroresValidacion = [];
  }

  obtenerPlantillasFiltradas(): Plantilla[] {
    if (!this.tipoSubidaFiltro) return [];
    return this.plantillas.filter(p => p.tipo_proceso === this.tipoSubidaFiltro);
  }

  // --- CAMBIO DE PLANTILLA ---
  onPlantillaChange(): void {
    this.archivoSeleccionado = null;
    this.archivoValido = false;
    this.erroresValidacion = [];
    this.plantillaSeleccionada = this.plantillas.find(p => p.id === Number(this.plantillaSeleccionadaId)) || null;
  }

  // --- FILTRAR HISTORIAL POR TIPO DE PROCESO ---
  obtenerHistorialFiltrado(): HistorialImportacionResponse[] {
    return this.historialCargas.filter(h => h.tipo_subida === this.pestanaHistorialActiva);
  }

  // --- MODAL DE AUDITORÍA DETALLADA ---
  abrirModalAuditoria(carga: HistorialImportacionResponse): void {
    this.cargaAuditoriaSeleccionada = carga;
    this.modalAuditoriaAbierto = true;
  }

  cerrarModalAuditoria(): void {
    this.cargaAuditoriaSeleccionada = null;
    this.modalAuditoriaAbierto = false;
  }

  // --- COMPORTAMIENTO DRAG & DROP ---
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(): void {
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.validarTipoArchivo(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.validarTipoArchivo(event.target.files[0]);
    }
  }

  validarTipoArchivo(file: File): void {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'xlsx' && extension !== 'xls') {
      this.toastService.error('Formato no permitido. Solo se aceptan archivos Excel (.xlsx, .xls)');
      return;
    }
    this.archivoSeleccionado = file;
    this.archivoValido = false;
    this.erroresValidacion = [];
  }

  quitarArchivo(): void {
    this.archivoSeleccionado = null;
    this.archivoValido = false;
    this.erroresValidacion = [];
  }

  // --- SIMULAR VALIDACIÓN (DRY-RUN) ---
  ejecutarValidacion(): void {
    if (!this.tramoSeleccionadoId || !this.plantillaSeleccionadaId || !this.archivoSeleccionado) {
      this.toastService.warning('Complete todos los campos requeridos antes de validar.');
      return;
    }

    this.cargando = true;
    this.erroresValidacion = [];
    this.archivoValido = false;

    this.importacionService.validarArchivo(
      Number(this.tramoSeleccionadoId),
      Number(this.plantillaSeleccionadaId),
      this.archivoSeleccionado
    ).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.es_valido) {
          this.archivoValido = true;
          this.toastService.success('¡Archivo validado con éxito! Listo para importar 🎉');
        } else {
          this.erroresValidacion = res.errores;
          this.toastService.error('Se encontraron errores en la validación del Excel.');
        }
      },
      error: (err) => {
        this.cargando = false;
        if (err.error?.errores && Array.isArray(err.error.errores)) {
          this.erroresValidacion = err.error.errores;
        } else if (err.error?.detail && Array.isArray(err.error.detail)) {
          this.erroresValidacion = err.error.detail;
        } else {
          const msj = err.error?.detail || 'Error en la conexión con el servidor.';
          this.erroresValidacion = [{
            fila: 1,
            columna: 'General / Firma',
            mensaje: msj
          }];
        }
        this.toastService.error('El archivo Excel no superó los controles de validación.');
      }
    });
  }

  // --- CONFIRMAR Y PROCESAR INGESTA ---
  confirmarYProcesar(): void {
    if (!this.tramoSeleccionadoId || !this.plantillaSeleccionadaId || !this.archivoSeleccionado || !this.archivoValido) {
      this.toastService.warning('El archivo no ha sido validado correctamente.');
      return;
    }

    Swal.fire({
      title: '¿Confirmar Importación?',
      text: `Se iniciará el proceso de carga de deudas bajo la plantilla "${this.plantillaSeleccionada?.nombre}". Esta operación es irreversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, Cargar Base',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-5 py-2.5 rounded-xl font-semibold text-white',
        cancelButton: 'px-5 py-2.5 rounded-xl font-semibold'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.iniciarIngesta();
      }
    });
  }

  iniciarIngesta(): void {
    this.pasoActual = 3;
    this.cargandoProgreso = true;
    this.porcentajeProgreso = 15;
    this.resumenCarga = null;

    const intervalo = setInterval(() => {
      if (this.porcentajeProgreso < 92) {
        this.porcentajeProgreso += Math.floor(Math.random() * 6) + 3;
      }
    }, 400);

    this.importacionService.procesarArchivo(
      Number(this.tramoSeleccionadoId),
      Number(this.plantillaSeleccionadaId),
      this.archivoSeleccionado!
    ).subscribe({
      next: (resumen) => {
        clearInterval(intervalo);
        this.porcentajeProgreso = 100;
        setTimeout(() => {
          this.resumenCarga = resumen;
          this.cargandoProgreso = false;
          this.cargarHistorial(); // Refrescar el historial abajo de forma automática
          this.toastService.success('¡Importación completada con éxito! Base de datos actualizada 🎉');
        }, 500);
      },
      error: (err) => {
        clearInterval(intervalo);
        this.cargandoProgreso = false;
        this.pasoActual = 2;
        const msj = err.error?.detail || 'Ocurrió un error inesperado al insertar la base de deudas.';
        Swal.fire({
          title: 'Error de Ingesta',
          text: msj,
          icon: 'error',
          confirmButtonColor: '#0f172a',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'px-5 py-2.5 rounded-xl font-semibold text-white'
          }
        });
      }
    });
  }

  // --- VOLVER A SUBIR OTRA BASE ---
  resetearProceso(): void {
    this.tipoSubidaFiltro = null;
    this.plantillaSeleccionadaId = null;
    this.plantillaSeleccionada = null;
    this.archivoSeleccionado = null;
    this.archivoValido = false;
    this.erroresValidacion = [];
    this.resumenCarga = null;
    this.porcentajeProgreso = 0;
    this.pasoActual = 1;
  }
}
