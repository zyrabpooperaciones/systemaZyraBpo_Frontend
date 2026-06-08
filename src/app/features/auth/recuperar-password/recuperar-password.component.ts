import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recuperar-password.component.html',
  styleUrls: ['./recuperar-password.component.css']
})
export class RecuperarPasswordComponent implements OnInit {
  formCorreo!: FormGroup;
  formClave!: FormGroup;
  
  token: string | null = null; // Guardará el token temporal si viene en la URL
  cargando = false;
  mensajeError: string | null = null;
  mensajeExito: string | null = null;

  // Referencias para controlar el ojito de las contraseñas
  @ViewChild('inputNuevaClave') inputNuevaClave!: ElementRef;
  @ViewChild('inputConfirmarClave') inputConfirmarClave!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    // Escuchamos si viene un "?token=XYZ" en la barra de direcciones
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || null;
    });
  }

  private inicializarFormularios(): void {
    // Formulario Fase 1: Solicitar Token con Email
    this.formCorreo = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]]
    });

    // Formulario Fase 2: Reescritura de contraseña seguro
    this.formClave = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmarPassword: ['', [Validators.required]]
    });
  }

  /**
   * FASE 1: Envía el correo institucional a FastAPI
   */
  enviarSolicitudCorreo(): void {
    if (this.formCorreo.invalid) {
      this.formCorreo.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = null;
    this.mensajeExito = null;

    this.authService.solicitarRecuperacion(this.formCorreo.value.email).subscribe({
      next: (res) => {
        this.cargando = false;
        this.mensajeExito = res.mensaje;
        
        // Impresión en consola para pruebas locales rápidas sin abrir Postgres
        if (res.token_de_prueba) {
          console.log('%c🔑 TOKEN DE PRUEBA GENERADO:', 'background: #222; color: #bada55; font-size: 14px;', res.token_de_prueba);
        }
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = err.error?.detail || 'No se pudo procesar la solicitud.';
      }
    });
  }

  /**
   * FASE 2: Envía el token original y la nueva contraseña cifrada a FastAPI
   */
  enviarNuevaContrasena(): void {
    if (this.formClave.invalid) {
      this.formClave.markAllAsTouched();
      return;
    }

    const { password, confirmarPassword } = this.formClave.value;

    if (password !== confirmarPassword) {
      this.mensajeError = 'Las contraseñas introducidas no coinciden.';
      return;
    }

    this.cargando = true;
    this.mensajeError = null;

    this.authService.restablecerPassword({
      token: this.token!,
      nueva_password: password
    }).subscribe({
      next: (res) => {
        this.cargando = false;
        this.mensajeExito = res.mensaje;
        // Esperamos 4 segundos para que el usuario lea el éxito y lo mandamos al Login
        setTimeout(() => this.router.navigate(['/login']), 4000);
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = err.error?.detail || 'El enlace expiró o es inválido.';
      }
    });
  }

  // --- CONTROL DEL OJITO INTERACTIVO (Para ambos inputs de clave) ---
  mostrarClaves(): void {
    if (this.inputNuevaClave) this.inputNuevaClave.nativeElement.type = 'text';
    if (this.inputConfirmarClave) this.inputConfirmarClave.nativeElement.type = 'text';
  }

  ocultarClaves(): void {
    if (this.inputNuevaClave) this.inputNuevaClave.nativeElement.type = 'password';
    if (this.inputConfirmarClave) this.inputConfirmarClave.nativeElement.type = 'password';
  }
}