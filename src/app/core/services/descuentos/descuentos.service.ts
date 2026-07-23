import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface DescuentoConfig {
  id?: number;
  tramo_id: number;
  nombre: string;
  descuento_monto_fijo: number;
  pct_descuento_capital: number;
  pct_descuento_interes: number;
  pct_descuento_gasto: number;
  campanas: string[];
  departamentos: string[];
  perfiles_riesgo: string[];
  segmentos_rolling: string[];
  activo?: boolean;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DescuentosService {
  private URL_API = `${environment.apiUrl}/descuentos`;

  constructor(private http: HttpClient) {}

  crearDescuento(descuento: DescuentoConfig): Observable<DescuentoConfig> {
    return this.http.post<DescuentoConfig>(this.URL_API, descuento);
  }

  listarDescuentosTramo(tramoId: number): Observable<DescuentoConfig[]> {
    return this.http.get<DescuentoConfig[]>(`${this.URL_API}/tramo/${tramoId}`);
  }

  desactivarDescuento(id: number): Observable<DescuentoConfig> {
    return this.http.put<DescuentoConfig>(`${this.URL_API}/${id}/desactivar`, {});
  }

  obtenerCatalogosFiltrados(tramoId: number): Observable<{
    campanas: string[];
    departamentos: string[];
    perfiles_riesgo: string[];
    segmentos_rolling: string[];
  }> {
    return this.http.get<{
      campanas: string[];
      departamentos: string[];
      perfiles_riesgo: string[];
      segmentos_rolling: string[];
    }>(`${this.URL_API}/catalogos-filtrados/${tramoId}`);
  }
}
