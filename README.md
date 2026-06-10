# Zyra BPO - Portal Operativo (Frontend)

Este es el repositorio del frontend para la plataforma de gestión centralizada de **Zyra BPO**. La aplicación está construida con **Angular v19** y diseñada visualmente usando **Tailwind CSS v4** para proporcionar una experiencia de usuario rápida, reactiva y moderna.

---

## 🚀 Características Clave Implementadas

1. **Seguridad y Autenticación:**
   - **Login Interactivo:** Formulario reactivo blindado con validaciones de formato de correo corporativo y longitud de clave.
   - **Seguridad Perimetral (`authGuard`):** Protege las rutas internas (como el `/dashboard`) impidiendo el acceso a usuarios sin sesión activa.
   - **Inyección Automática de Tokens (`authInterceptor`):** Inserta la cabecera `Authorization: Bearer <token>` en cada consulta al backend de forma automática.
   - **Cierre por Expiración (`errorInterceptor`):** Detecta respuestas de servidor tipo `401 Unauthorized` o `403 Forbidden` (token expirado en base de datos) y destruye la sesión en el navegador redirigiendo al Login.
2. **Recuperación de Contraseña:**
   - Flujo de reestablecimiento de credenciales conectado a FastAPI para la generación y envío de tokens temporales de 15 minutos al correo institucional del agente.
3. **Sistema de Alertas (Toasts):**
   - Panel de notificaciones flotantes animadas y reactivas en tiempo real mediante **Angular Signals**, proporcionando feedback visual premium ante aciertos, errores del backend o advertencias de validación.

---

## 🛠️ Requisitos Previos

Asegúrate de tener instalado en tu entorno de desarrollo local:
- [Node.js](https://nodejs.org/) (Versión recomendada: v18+ o v20+ LTS)
- [Angular CLI](https://angular.dev/tools/cli) (Versión 19.x)
- El **Backend de Zyra BPO** corriendo en tu máquina (por defecto en `http://localhost:8000`).

---

## 💻 Instalación y Ejecución Local

Sigue estos pasos para levantar la aplicación en tu entorno local:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/zyrabpooperaciones/systemaZyraBpo_Frontend.git
   cd systemaZyraBpo_Frontend
   ```

2. **Instalar las dependencias de Node:**
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno:**
   La aplicación utiliza archivos de configuración ubicados en `src/environments/` para conectarse a la API:
   - `environment.development.ts` (desarrollo local): Apunta por defecto a `http://localhost:8000`.
   - `environment.ts` (producción): Para definir la URL de la API del servidor de producción.

4. **Correr el servidor de desarrollo:**
   ```bash
   npm start
   # o alternativamente:
   ng serve
   ```

5. **Acceder a la aplicación:**
   Abre tu navegador y navega a `http://localhost:4200/`. La página se recargará automáticamente al detectar cambios en el código.

---

## 📂 Arquitectura del Proyecto

El código está organizado siguiendo las recomendaciones modernas de Angular (Standalone Components) y modularidad por características:

- **`src/app/core/`:** Servicios, guards, interceptores y componentes globales/singletons de la aplicación.
  - `components/toast/`: Componente visual de notificaciones flotantes.
  - `guards/auth/`: Lógica que bloquea rutas protegidas.
  - `interceptors/`: Interceptores HTTP para el token Bearer y control de errores.
  - `models/`: Interfaces TypeScript estables (`Usuario`, `LoginResponse`).
  - `services/`: Lógica de consumo de APIs externas (Auth, Toasts).
- **`src/app/features/`:** Páginas del sistema.
  - `auth/`: Vistas de Login y Recuperar Contraseña.
  - `dashboard/`: Panel interno de operaciones (actualmente placeholder).
- **`src/environments/`:** Configuraciones dinámicas de la URL de API.

---

## 📦 Compilación para Producción

Para generar los archivos listos para el despliegue en un servidor de producción, ejecuta:

```bash
npm run build
```

Esto compilará la aplicación y optimizará el código en la carpeta `dist/zyra-frontend`.
