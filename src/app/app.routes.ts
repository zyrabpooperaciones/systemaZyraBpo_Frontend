import { Routes } from '@angular/router';
// --- IMPORTAMOS TU GUARDIA DE SEGURIDAD DEL CORE ---
import { authGuard } from './core/guards/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  // 🔑 NUEVA RUTA CON LAZY LOADING PARA EL PORTAL DE SEGURIDAD
  {
    path: 'recuperar-password',
    loadComponent: () => import('./features/auth/recuperar-password/recuperar-password.component').then(m => m.RecuperarPasswordComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    // REGLA DE SEGURIDAD: El guardia bloquea esta pantalla si sessionStorage está vacío
    canActivate: [authGuard],
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./features/dashboard/inicio/inicio.component').then(m => m.InicioComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/dashboard/usuarios/usuarios.component').then(m => m.UsuariosComponent)
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/dashboard/roles/roles.component').then(m => m.RolesComponent)
      },
      {
        path: 'volcados',
        loadComponent: () => import('./features/dashboard/volcados/volcados.component').then(m => m.VolcadosComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/dashboard/perfil/perfil.component').then(m => m.PerfilComponent)
      },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      }
    ]
  },
  // Redirección por defecto: si entran a la raíz, los mandamos directo al Login
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  // Comodín por si escriben cualquier ruta inexistente, los regresa al login
  {
    path: '**',
    redirectTo: 'login'
  }
];