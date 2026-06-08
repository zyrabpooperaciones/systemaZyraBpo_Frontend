import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  formularioLogin: FormGroup;
  mensajeError: string | null = null;
  cargando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Construimos las validaciones del formulario
    this.formularioLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  /**
   * Ejecuta el disparo hacia FastAPI cuando el usuario presiona "Ingresar"
   */
  alEnviar(): void {
    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = null;

    this.authService.login(this.formularioLogin.value).subscribe({
      next: (respuesta) => {
        this.cargando = false;
        // ¡Éxito! Redirigimos al Dashboard (pantalla interna)
        this.router.navigate(['/dashboard']);
      },
      error: (errorHttp) => {
        this.cargando = false;
        // CAPTURAMOS EL ESCUDO DE PYTHON: Extraemos el mensaje de error exacto enviado por FastAPI
        if (errorHttp.error && errorHttp.error.detail) {
          this.mensajeError = errorHttp.error.detail;
        } else {
          this.mensajeError = 'Ocurrió un error inesperado. Intente más tarde.';
        }
      }
    });
  }
}