import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ValidationErrorDetail {
  fila: number;
  columna: string;
  mensaje: string;
}

export interface ValidationResponse {
  es_valido: boolean;
  errores: ValidationErrorDetail[];
}

export interface ImportSummaryResponse {
  duracion_segundos: number;
  total_filas_procesadas: number;
  clientes_nuevos: number;
  clientes_actualizados: number;
  cargos_nuevos: number;
  cargos_actualizados: number;
  telefonos_nuevos: number;
  telefono_uso_actualizados: number;
  movimientos_financieros_creados: number;
  monto_deuda_inicial_total: number;
  monto_interes_total: number;
  monto_gasto_adm_total: number;
}

export interface TramoActivoResponse {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface HistorialImportacionResponse {
  id: number;
  tramo_id: number;
  nombre_archivo: string;
  hash_archivo: string;
  tipo_subida: string;
  fecha_importacion: string;
  usuario_id: number;
  usuario_nombre: string;
  registros_procesados: number;
  clientes_nuevos: number;
  clientes_actualizados: number;
  cargos_nuevos: number;
  cargos_actualizados: number;
  telefonos_nuevos: number;
  telefono_uso_actualizados: number;
  movimientos_financieros_creados: number;
  monto_deuda_inicial_total: number;
  monto_interes_total: number;
  monto_gasto_adm_total: number;
  duracion_segundos: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImportacionService {
  private readonly URL_IMPORTACION = `${environment.apiUrl}/importacion`;

  constructor(private http: HttpClient) {}

  obtenerTramosActivos(): Observable<TramoActivoResponse[]> {
    return this.http.get<TramoActivoResponse[]>(`${this.URL_IMPORTACION}/tramos`);
  }

  obtenerHistorial(tramoId: number): Observable<HistorialImportacionResponse[]> {
    return this.http.get<HistorialImportacionResponse[]>(`${this.URL_IMPORTACION}/historial/${tramoId}`);
  }

  validarArchivo(tramoId: number, plantillaId: number, file: File): Observable<ValidationResponse> {
    const formData = new FormData();
    formData.append('tramo_id', tramoId.toString());
    formData.append('plantilla_id', plantillaId.toString());
    formData.append('file', file, file.name);

    return this.http.post<ValidationResponse>(`${this.URL_IMPORTACION}/validar`, formData);
  }

  procesarArchivo(tramoId: number, plantillaId: number, file: File): Observable<ImportSummaryResponse> {
    const formData = new FormData();
    formData.append('tramo_id', tramoId.toString());
    formData.append('plantilla_id', plantillaId.toString());
    formData.append('file', file, file.name);

    return this.http.post<ImportSummaryResponse>(`${this.URL_IMPORTACION}/procesar`, formData);
  }
}
