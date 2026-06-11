import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MockRol {
  nombre: string;
  descripcion: string;
  usuariosAsignados: number;
  permisos: string[];
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles.component.html',
  styles: []
})
export class RolesComponent {
  // Roles de ejemplo para el mockup premium
  roles: MockRol[] = [
    { 
      nombre: 'Administrador', 
      descripcion: 'Acceso total a todos los módulos operativos, configuración del sistema, usuarios y logs.', 
      usuariosAsignados: 2, 
      permisos: ['Crear Usuarios', 'Eliminar Usuarios', 'Configurar Roles', 'Descargar Volcados'] 
    },
    { 
      nombre: 'Supervisor', 
      descripcion: 'Visualización y reporte de métricas operativas. Gestión básica de usuarios del equipo.', 
      usuariosAsignados: 3, 
      permisos: ['Ver Usuarios', 'Editar Usuarios', 'Generar Reportes'] 
    },
    { 
      nombre: 'Agente', 
      descripcion: 'Acceso limitado a la ejecución de tareas operativas y registros asignados.', 
      usuariosAsignados: 7, 
      permisos: ['Ver Tareas', 'Registrar Operaciones'] 
    }
  ];
}
