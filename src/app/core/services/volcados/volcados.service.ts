import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VolcadosService {
  private apiUrl = `${environment.apiUrl}/volcados`;

  constructor(private http: HttpClient) {}

  generarVolcadoTramos(formData: FormData): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/generar/tramos`, formData, {
      responseType: 'blob'
    });
  }

  generarVolcadoIvr(formData: FormData): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/generar/ivr`, formData, {
      responseType: 'blob'
    });
  }
}
