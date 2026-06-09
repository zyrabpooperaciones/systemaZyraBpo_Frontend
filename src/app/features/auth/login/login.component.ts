import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  formularioLogin: FormGroup;
  mensajeError: string | null = null;
  cargando: boolean = false;

  // Hacemos referencia al input de contraseña usando el ID (#inputPassword) del HTML
  @ViewChild('inputPassword') inputPassword!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    // Construimos las validaciones del formulario institucionales
    this.formularioLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  /**
   * Muestra la contraseña cambiando el tipo de input a 'text' temporalmente
   */
  mostrarContrasena(): void {
    if (this.inputPassword) {
      this.inputPassword.nativeElement.type = 'text';
    }
  }

  /**
   * Oculta la contraseña regresando el tipo de input a 'password'
   */
  ocultarContrasena(): void {
    if (this.inputPassword) {
      this.inputPassword.nativeElement.type = 'password';
    }
  }

  /**
   * Ejecuta el disparo hacia FastAPI cuando el usuario presiona "Ingresar"
   */
  alEnviar(): void {
    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      this.toastService.warning('Por favor, completa los campos obligatorios.');
      return;
    }

    this.cargando = true;
    this.mensajeError = null;

    this.authService.login(this.formularioLogin.value).subscribe({
      next: (respuesta) => {
        this.cargando = false;
        this.toastService.success(`¡Bienvenido, ${respuesta.usuario.nombre_completo}!`);
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
        this.toastService.error(this.mensajeError || 'Ocurrió un error inesperado. Intente más tarde.');
      }
    });
  }
}