import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TelefonoClienteDetalle {
  id: number;
  numero: string;
  tipo: string;
  prioridad: number;
  estado: string;
  fecha_cambio: string;
}

export interface CargoClienteDetalle {
  id: number;
  numero_cargo: string;
  campana_nombre: string;
  dias_atraso: number;
  fecha_cierre: string | null;
  monto_inicial: number;
  monto_interes: number;
  monto_gasto_adm: number;
  monto_pagado: number;
  saldo_cobrar: number;
  descuento_aplicable: number;
  monto_para_liquidar: number;
  estado: string;
  observacion: string | null;
}

export interface MovimientoCargoDetalle {
  id: number;
  numero_cargo: string;
  tipo_movimiento: string;
  monto: number;
  fecha_movimiento: string;
}

export interface DetalleCliente360Response {
  id: number;
  codigo_cliente_belcor: string;
  nombre_completo: string;
  numero_documento: string | null;
  correo_electronico: string | null;
  departamento: string | null;
  seccion: string | null;
  perfil_riesgo: string | null;
  segmento_rolling: string | null;
  telefonos: TelefonoClienteDetalle[];
  cargos: CargoClienteDetalle[];
  movimientos: MovimientoCargoDetalle[];
}

export interface ClienteSearchItem {
  id: number;
  codigo_cliente_belcor: string;
  nombre_completo: string;
  numero_documento: string | null;
  cantidad_cargos: number;
  saldo_total_pendiente: number;
  saldo_neto_pendiente: number;
  telefono_principal: string | null;
  campanas_activas: string[];
  estado_general: string;
}

export interface PaginatedClientesResponse {
  total: number;
  items: ClienteSearchItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private readonly URL_CLIENTES = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  buscarClientes(filters: {
    query?: string;
    tramo_id?: number;
    campana_id?: number;
    estado?: string;
    limit: number;
    offset: number;
  }): Observable<PaginatedClientesResponse> {
    let params = new HttpParams()
      .set('limit', filters.limit.toString())
      .set('offset', filters.offset.toString());

    if (filters.query) {
      params = params.set('query', filters.query);
    }
    if (filters.tramo_id) {
      params = params.set('tramo_id', filters.tramo_id.toString());
    }
    if (filters.campana_id) {
      params = params.set('campana_id', filters.campana_id.toString());
    }
    if (filters.estado) {
      params = params.set('estado', filters.estado);
    }

    return this.http.get<PaginatedClientesResponse>(`${this.URL_CLIENTES}/buscar`, { params });
  }

  obtenerDetalleCliente(clienteId: number): Observable<DetalleCliente360Response> {
    return this.http.get<DetalleCliente360Response>(`${this.URL_CLIENTES}/${clienteId}/detalle`);
  }

  listarCampanas(): Observable<{ id: number; nombre: string }[]> {
    return this.http.get<{ id: number; nombre: string }[]>(`${this.URL_CLIENTES}/campanas`);
  }
}
