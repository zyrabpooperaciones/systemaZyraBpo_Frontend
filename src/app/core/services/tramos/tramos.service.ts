import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Tramo {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface Columna {
  id?: number;
  tramo_id?: number;
  tipo_campo: string; // 'DATO' o 'MONTO'
  campo_sistema: string;
  nombre_columna_excel: string;
  es_obligatorio: boolean;
  activo: boolean;
}

export interface Telefono {
  id?: number;
  tramo_id?: number;
  nombre_columna_excel: string;
  prioridad: number;
  activo: boolean;
}

export interface Plantilla {
  id: number;
  tramo_id: number;
  nombre: string;
  tipo_proceso: string;
  activo: boolean;
}

export interface PlantillaDetail {
  id: number;
  tramo_id: number;
  nombre: string;
  tipo_proceso: string;
  activo: boolean;
  columnas: Columna[];
  telefonos: Telefono[];
}

@Injectable({
  providedIn: 'root'
})
export class TramosService {
  private readonly URL_TRAMOS = `${environment.apiUrl}/tramos`;
  private readonly URL_PLANTILLAS = `${environment.apiUrl}/plantillas`;

  constructor(private http: HttpClient) {}

  // ============================================================================
  // TRAMOS
  // ============================================================================

  listarTramos(verInactivos = false): Observable<Tramo[]> {
    return this.http.get<Tramo[]>(`${this.URL_TRAMOS}?ver_inactivos=${verInactivos}`);
  }

  obtenerTramo(id: number): Observable<Tramo> {
    return this.http.get<Tramo>(`${this.URL_TRAMOS}/${id}`);
  }

  actualizarEstadoTramo(id: number, activo: boolean): Observable<Tramo> {
    return this.http.put<Tramo>(`${this.URL_TRAMOS}/${id}/estado`, { activo });
  }

  // ============================================================================
  // CATALOGO DE COLUMNAS (DATOS Y MONTOS)
  // ============================================================================

  obtenerColumnas(tramoId: number): Observable<Columna[]> {
    return this.http.get<Columna[]>(`${this.URL_TRAMOS}/${tramoId}/columnas`);
  }

  guardarColumnas(tramoId: number, columnas: Columna[]): Observable<Columna[]> {
    return this.http.post<Columna[]>(`${this.URL_TRAMOS}/${tramoId}/columnas`, columnas);
  }

  // ============================================================================
  // CATALOGO DE TELEFONOS
  // ============================================================================

  obtenerTelefonos(tramoId: number): Observable<Telefono[]> {
    return this.http.get<Telefono[]>(`${this.URL_TRAMOS}/${tramoId}/telefonos`);
  }

  guardarTelefonos(tramoId: number, telefonos: Telefono[]): Observable<Telefono[]> {
    return this.http.post<Telefono[]>(`${this.URL_TRAMOS}/${tramoId}/telefonos`, telefonos);
  }

  // ============================================================================
  // PLANTILLAS DE MAPEO
  // ============================================================================

  listarPlantillas(tramoId: number): Observable<Plantilla[]> {
    return this.http.get<Plantilla[]>(`${this.URL_TRAMOS}/${tramoId}/plantillas`);
  }

  crearPlantilla(tramoId: number, payload: { nombre: string; tipo_proceso: string; copiar_desde_plantilla_id?: number | null }): Observable<Plantilla> {
    return this.http.post<Plantilla>(`${this.URL_TRAMOS}/${tramoId}/plantillas`, payload);
  }

  obtenerPlantilla(plantillaId: number): Observable<PlantillaDetail> {
    return this.http.get<PlantillaDetail>(`${this.URL_PLANTILLAS}/${plantillaId}`);
  }

  actualizarAsociaciones(plantillaId: number, payload: { columnas_ids: number[]; telefonos_ids: number[] }): Observable<PlantillaDetail> {
    return this.http.put<PlantillaDetail>(`${this.URL_PLANTILLAS}/${plantillaId}/asociaciones`, payload);
  }

  eliminarPlantilla(plantillaId: number): Observable<any> {
    return this.http.delete<any>(`${this.URL_PLANTILLAS}/${plantillaId}`);
  }

  obtenerResumenKpi(tramoId: number): Observable<TramoResumenKpi> {
    return this.http.get<TramoResumenKpi>(`${this.URL_TRAMOS}/${tramoId}/resumen-kpi`);
  }
}

export interface TramoResumenKpi {
  total_clientes: number;
  total_cargos: number;
  cargos_activos: number;
  cargos_vencidos: number;
  cargos_pagados: number;
  fecha_cierre_cercana: string | null;
  fecha_cierre_cercana_campanas: string[];
  monto_inicial_total: number;
  monto_interes_total: number;
  monto_gasto_adm_total: number;
  monto_pagado_total: number;
  saldo_cobrar_total: number;
  porcentaje_recuperacion: number;
}
