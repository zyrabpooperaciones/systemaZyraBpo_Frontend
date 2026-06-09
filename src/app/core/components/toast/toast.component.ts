import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <div 
        *ngFor="let toast of toastService.toasts()" 
        [ngClass]="{
          'bg-white/95 border-emerald-200/80 text-slate-900 shadow-emerald-950/5': toast.tipo === 'success',
          'bg-white/95 border-rose-200/80 text-slate-900 shadow-rose-950/5': toast.tipo === 'error',
          'bg-white/95 border-amber-200/80 text-slate-900 shadow-amber-950/5': toast.tipo === 'warning',
          'bg-white/95 border-slate-200/80 text-slate-900 shadow-slate-950/5': toast.tipo === 'info'
        }"
        class="pointer-events-auto flex gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-in"
      >
        <!-- Icono según tipo de alerta -->
        <!-- Success Icon -->
        <div *ngIf="toast.tipo === 'success'" class="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/50 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <!-- Error Icon -->
        <div *ngIf="toast.tipo === 'error'" class="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200/50 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <!-- Warning Icon -->
        <div *ngIf="toast.tipo === 'warning'" class="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/50 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <!-- Info Icon -->
        <div *ngIf="toast.tipo === 'info'" class="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/50 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <!-- Mensaje -->
        <div class="flex-1 flex flex-col justify-center text-sm font-semibold tracking-tight text-slate-900 leading-tight">
          {{ toast.mensaje }}
        </div>

        <!-- Botón cerrar -->
        <div class="flex items-center">
          <button 
            (click)="toastService.remover(toast.id)" 
            class="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from {
        transform: translateY(-1rem);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
