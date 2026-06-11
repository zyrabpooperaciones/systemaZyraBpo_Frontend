import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MockUsuario {
  nombre: string;
  email: string;
  rol: string;
  cargo: string;
  estado: 'activo' | 'inactivo';
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.component.html',
  styles: []
})
export class UsuariosComponent {
  // Datos mockeados para dar un aspecto visual excelente en esta fase
  usuarios: MockUsuario[] = [
    { nombre: 'Jairo B.', email: 'jairo@zyrabpo.com', rol: 'Administrador', cargo: 'Director General', estado: 'activo' },
    { nombre: 'Ana María G.', email: 'ana.gonzalez@zyrabpo.com', rol: 'Supervisor', cargo: 'Líder de Operaciones', estado: 'activo' },
    { nombre: 'Carlos R.', email: 'carlos.rojas@zyrabpo.com', rol: 'Agente', cargo: 'BPO Specialist', estado: 'activo' },
    { nombre: 'Sofía L.', email: 'sofia.lopez@zyrabpo.com', rol: 'Agente', cargo: 'Soporte Técnico', estado: 'inactivo' }
  ];
}
