import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MockVolcado {
  id: string;
  fecha: string;
  tamano: string;
  estado: 'completado' | 'procesando' | 'fallido';
  tipo: 'manual' | 'programado';
  generadoPor: string;
}

@Component({
  selector: 'app-volcados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './volcados.component.html',
  styles: []
})
export class VolcadosComponent {
  // Lista de volcados mock para diseño premium
  volcados: MockVolcado[] = [
    { id: 'VOL-2026-0611-01', fecha: '2026-06-11 02:00:05', tamano: '45.8 MB', estado: 'completado', tipo: 'programado', generadoPor: 'Sistema' },
    { id: 'VOL-2026-0610-02', fecha: '2026-06-10 18:34:12', tamano: '42.1 MB', estado: 'completado', tipo: 'manual', generadoPor: 'Jairo B.' },
    { id: 'VOL-2026-0609-01', fecha: '2026-06-09 02:00:10', tamano: '41.9 MB', estado: 'completado', tipo: 'programado', generadoPor: 'Sistema' },
    { id: 'VOL-2026-0608-01', fecha: '2026-06-08 02:00:00', tamano: '3.1 MB', estado: 'fallido', tipo: 'programado', generadoPor: 'Sistema' }
  ];
}
