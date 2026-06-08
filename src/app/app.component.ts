import { Component } from '@angular/core';
// 1. IMPORTAMOS EL MOTOR DE RUTAS DE ANGULAR
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  // 2. REGLA ARQUITECTÓNICA: Activamos el RouterOutlet aquí dentro
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  // Dejamos el componente raíz limpio para que el enrutador tome el control de las pantallas
  title = 'zyra-frontend';
}