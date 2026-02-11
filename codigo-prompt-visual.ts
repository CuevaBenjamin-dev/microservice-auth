formulario.html(front) :


<div class="container">
  <!-- HEADER -->
  <header class="header">
    <h1>Generador de Certificados</h1>
    <p>Complete los datos y genere uno o varios certificados en un solo archivo PPTX.</p>

    <!-- 🔐 CERRAR SESIÓN -->
    <button type="button" class="btn-logout" (click)="cerrarSesion()">Cerrar sesión</button>
  </header>

  <form [formGroup] = "form"(ngSubmit) = "onSubmit()" class="form" >
    <div formArrayName="modelos">
      <div
        class="modelo-card"
        *ngFor="let modelo of modelos.controls; let i = index"
        [formGroupName]="i"
      >
        <div class="modelo-header">
          <h3>Modelo {{ i + 1 }}</h3>

          <button
            type="button"
            class="btn-remove"
            (click)="eliminarModelo(i)"
            *ngIf="modelos.length > 1"
          >
            ✕
          </button>
        </div>

        <!--MODELO DE CERTIFICADO-- >
        <div class="field">
          <label>Modelo de certificado</label>
          <select formControlName="modeloCertificado">
            <option value="" disabled>Seleccione una opción</option>
            <option value="INSTITUTO">Instituto</option>
            <option value="UNIVERSIDAD_2QRS">Universidad 2QRS</option>
            <option value="UNIVERSIDAD_AZUL">Universidad Azul</option>
            <option value="COLEGIO_ABOGADOS_CALLAO">Colegio de Abogados del Callao</option>
          </select>
        </div>

        <!--TIPO DE CERTIFICADO-- >
        <div class="field">
          <label>Tipo de certificado</label>
          <select formControlName="tipoModelo">
            <option value="" disabled>Seleccione una opción</option>
            <option value="DIPLOMADO">Diplomado</option>
            <option value="PROGRAMA DE ESPECIALIZACIÓN">Programa de Especialización</option>
            <option value="CURSO">Curso</option>
            <option value="CURSO_DE_CAPACITACION">Curso de Capacitación</option>
            <option value="CURSO_DE_ACTUALIZACION">Curso de Actualización</option>
          </select>
        </div>

        <div class="grid">
          <div class="field">
            <label>Nombres</label>
            <input type="text" formControlName="nombres" />
          </div>

          <div class="field">
            <label>Apellidos</label>
            <input type="text" formControlName="apellidos" />
          </div>
        </div>

        <div class="field">
          <label>Tema</label>
          <input type="text" formControlName="temaDiplomado" />
        </div>

        <div class="grid">
          <div class="field">
            <label>Fecha inicio</label>
            <input type="date" formControlName="fechaInicio" />
          </div>

          <div class="field">
            <label>Fecha fin</label>
            <input type="date" formControlName="fechaFin" />
          </div>
        </div>

        <div class="grid">
          <div class="field">
            <label>Horas académicas</label>
            <input type="number" formControlName="horasAcademicas" />
          </div>

          <!-- <div class="field">
            <label>Créditos académicos</label>
            <input type="number" formControlName="creditosAcademicos" />
          </div> -->
          <div class="field">
            <label>Créditos académicos</label>
            <input type="number" formControlName="creditosAcademicos" />
          </div>
        </div>

        <div class="grid">
          <div class="field">
            <label>Folio N°</label>
            <input type="text" formControlName="folioNumero" />
          </div>

          <div class="field">
            <label>Fecha de emisión</label>
            <input type="date" formControlName="fechaEmision" />
          </div>
        </div>
      </div >
    </div >

    < !--ACCIONES -->
    <div class="actions">
      <button
        type="button"
        class="btn-add"
        (click)="agregarModelo()"
        [disabled]="modelos.length >= MAX_MODELOS"
      >
        + Agregar modelo
      </button>

      <a
        href="https://drive.google.com/file/d/1UBLykyA21zRTl-sqQzOj-y42hMMUhU_H/view"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-folios"
      >
        N° de Folios
      </a>

      <!-- 🔥 BOTÓN LIMPIAR-- >
  <button type="button" class="btn-clear" (click) = "limpiarFormulario()" > Limpiar</button >

    <button type="submit" class="btn-submit">Generar PPTX</button>
    </div >
  </form >
  < !--RESULTADO QR SLUGS-- >
  <div * ngIf="mostrarQrSlugs" class="qr-result" >
    <h3>Identificadores de códigos QR</h3>

    <div class="qr-list">
      <div class="qr-item" *ngFor="let slug of qrSlugs; let i = index">
        <span class="qr-index">{{ i + 1 }}.</span>
        <code>{{ slug }}</code>
      </div>
    </div >
  </div >
</div >

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
formulario.ts (front) :


import { CommonModule } from '@angular/common';
import { Component, Renderer2 } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormularioService } from '../../services/formularioService';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { EventsService } from '../../services/events-service';

interface ModeloFlags {
  autoFechaEmision: boolean;
  autoCreditos: boolean;
}

@Component({
  selector: 'app-formulario',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css',
})
export class Formulario {
  readonly MAX_MODELOS = 12;
  modeloFlags: ModeloFlags[] = [];

  form: FormGroup;

  qrSlugs: string[] = [];
  mostrarQrSlugs = false;

  private normalizarTexto(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quitar tildes
      .replace(/[^a-zA-Z0-9]/g, '') // quitar espacios y símbolos
      .toLowerCase();
  }

  private generarSlugQR(nombres: string, apellidos: string, tema: string): string {
    const primerNombre = nombres.trim().split(' ')[0] || '';
    const primerApellido = apellidos.trim().split(' ')[0] || '';

    return (
      this.normalizarTexto(primerNombre) +
      this.normalizarTexto(primerApellido) +
      this.normalizarTexto(tema)
    );
  }

  private MODELO_COLOR_MAP: Record<string, string> = {
    INSTITUTO: '#3b3a40',
    UNIVERSIDAD_2QRS: '#D14900',
    UNIVERSIDAD_AZUL: '#004B57',
    COLEGIO_ABOGADOS_CALLAO: '#0e8914', // azul institucional sobrio
  };

  private HORAS_A_MESES: Record<number, number> = {
    40: 1,
    50: 1,
    60: 1,
    70: 1,
    80: 1,
    100: 1,
    120: 1,
    130: 2,
    140: 2,
    150: 2,
    160: 2,
    170: 2,
    180: 2,
    190: 2,
    200: 2,
    210: 2,
    220: 2,
    230: 2,
    240: 2,
    250: 2,
    260: 3,
    270: 3,
    280: 3,
    290: 3,
    300: 3,
    310: 3,
    320: 3,
    330: 3,
    340: 3,
    350: 3,
    360: 3,
    370: 4,
    380: 4,
    390: 4,
    400: 4,
    410: 4,
    420: 4,
    430: 4,
    440: 4,
    450: 4,
    460: 4,
    470: 4,
    480: 5,
    490: 5,
    500: 5,
    510: 5,
    520: 5,
    530: 5,
    540: 5,
    550: 5,
    560: 5,
    570: 6,
    580: 6,
    590: 6,
    600: 6,
    610: 6,
    620: 6,
    630: 6,
    640: 6,
    650: 6,
    660: 6,
    670: 6,
    680: 7,
    690: 7,
    700: 7,
    710: 7,
    720: 7,
    730: 7,
    740: 7,
    750: 7,
    760: 7,
    770: 7,
    780: 8,
    790: 8,
    800: 8,
    810: 8,
    820: 8,
    830: 8,
    840: 8,
    850: 8,
    860: 8,
    870: 9,
    880: 9,
    890: 9,
    900: 9,
    910: 9,
    920: 9,
    930: 9,
    940: 9,
    950: 9,
    960: 9,
    970: 10,
    980: 10,
    990: 10,
    1000: 10,
    1010: 10,
    1020: 10,
    1030: 10,
    1040: 10,
    1050: 10,
    1060: 10,
    1070: 10,
    1080: 11,
    1090: 11,
    1100: 11,
    1110: 11,
    1120: 11,
    1130: 11,
    1140: 11,
    1150: 12,
    1160: 12,
    1170: 12,
    1180: 12,
    1190: 12,
    1200: 12,
    1210: 12,
    1220: 12,
    1230: 12,
    1240: 12,
    1250: 12,
  };

  constructor(
    private fb: FormBuilder,
    private service: FormularioService,
    private renderer: Renderer2,
    private router: Router,
    private authService: AuthService,
    private eventsService: EventsService,
  ) {
    this.form = this.fb.group({
      modelos: this.fb.array([]),
    });

    this.modelos.push(this.crearModeloForm(0));

    this.renderer.setStyle(document.body, 'background-color', '#f3f4f6');
    this.renderer.setStyle(document.body, 'transition', 'background-color 0.4s ease');
  }

  get modelos(): FormArray {
    return this.form.get('modelos') as FormArray;
  }

  private actualizarColorFondo(): void {
    const primerModelo = this.modelos.at(0) as FormGroup;
    const tipo = primerModelo.get('modeloCertificado')?.value;

    const color = this.MODELO_COLOR_MAP[tipo] || '#f3f4f6';
    this.renderer.setStyle(document.body, 'background-color', color);
  }

  private propagarModeloCertificado(valor: string, origenIndex: number): void {
    this.modelos.controls.forEach((ctrl, i) => {
      if (i === origenIndex) return;

      const modeloCtrl = (ctrl as FormGroup).get('modeloCertificado');
      if (modeloCtrl && modeloCtrl.value !== valor) {
        modeloCtrl.setValue(valor, { emitEvent: false });
      }
    });

    // 🔥 actualizar color de fondo una sola vez
    this.actualizarColorFondo();
  }

  private calcularFechaInicio(modelo: FormGroup): void {
    const fechaFinValue = modelo.get('fechaFin')?.value;
    const horas = modelo.get('horasAcademicas')?.value;

    if (!fechaFinValue || !horas) return;

    const meses = this.HORAS_A_MESES[horas];
    if (!meses) return;

    const fechaFin = new Date(fechaFinValue);
    const fechaBase = new Date(
      fechaFin.getFullYear(),
      fechaFin.getMonth() - meses,
      fechaFin.getDate(),
    );

    let fechaInicio = new Date(fechaBase);
    while (fechaInicio.getDay() !== 1) {
      fechaInicio.setDate(fechaInicio.getDate() - 1);
    }

    const yyyy = fechaInicio.getFullYear();
    const mm = String(fechaInicio.getMonth() + 1).padStart(2, '0');
    const dd = String(fechaInicio.getDate()).padStart(2, '0');

    modelo.get('fechaInicio')?.setValue(`${yyyy}-${mm}-${dd}`, {
      emitEvent: false,
    });
  }

  crearModeloForm(index: number, nombres: string = '', apellidos: string = ''): FormGroup {
    this.modeloFlags[index] = {
      autoFechaEmision: true,
      autoCreditos: true,
    };

    const grupo = this.fb.group({
      modeloCertificado: [
        this.modelos.at(0)?.get('modeloCertificado')?.value || '',
        Validators.required,
      ],
      tipoModelo: ['', Validators.required],

      nombres: [nombres, [Validators.required, Validators.minLength(2)]],
      apellidos: [apellidos, [Validators.required, Validators.minLength(2)]],

      temaDiplomado: ['', [Validators.required, Validators.minLength(3)]],

      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],

      horasAcademicas: [null, [Validators.required, Validators.min(1)]],
      creditosAcademicos: [0, [Validators.required, Validators.min(0)]],

      folioNumero: ['', [Validators.required, Validators.minLength(3)]],
      fechaEmision: ['', Validators.required],
    });

    // ---------- FECHA FIN → FECHA INICIO + EMISIÓN ----------
    grupo.get('fechaFin')?.valueChanges.subscribe((fechaFin) => {
      this.calcularFechaInicio(grupo);

      const flags = this.modeloFlags[index];
      const fechaEmisionCtrl = grupo.get('fechaEmision');

      if (!flags || !fechaEmisionCtrl || !fechaFin) return;

      // 🔁 AL CAMBIAR FECHA FIN, EL SISTEMA RECUPERA CONTROL
      flags.autoFechaEmision = true;

      fechaEmisionCtrl.setValue(fechaFin, { emitEvent: false });

      // ✅ FORZAR ACTUALIZACIÓN INMEDIATA DEL FOLIO
      actualizarFolio();
    });

    // ---------- FECHA EMISIÓN MANUAL ----------
    grupo.get('fechaEmision')?.valueChanges.subscribe(() => {
      const flags = this.modeloFlags[index];
      if (flags) flags.autoFechaEmision = false;
    });

    // ---------- HORAS → CRÉDITOS ----------
    grupo.get('horasAcademicas')?.valueChanges.subscribe((horas) => {
      this.calcularFechaInicio(grupo);

      const flags = this.modeloFlags[index];
      const creditosCtrl = grupo.get('creditosAcademicos');
      const horasNumber = Number(horas);

      if (!creditosCtrl || !flags) return;

      // 🔁 al cambiar horas, el sistema recupera control
      flags.autoCreditos = true;

      if (isNaN(horasNumber) || horasNumber <= 0) {
        creditosCtrl.setValue(0, { emitEvent: false });
        return;
      }

      const creditos = this.calcularCreditos(horasNumber);
      creditosCtrl.setValue(creditos, { emitEvent: false });
    });

    // ---------- CRÉDITOS MANUAL ----------
    grupo.get('creditosAcademicos')?.valueChanges.subscribe(() => {
      const flags = this.modeloFlags[index];
      if (flags) flags.autoCreditos = false;
    });

    grupo.get('modeloCertificado')?.valueChanges.subscribe((valor) => {
      if (!valor) return;

      // 1️⃣ Propagar a todos los certificados
      this.propagarModeloCertificado(valor, index);

      // 2️⃣ Recalcular folio (por si cambia Universidad Azul)
      actualizarFolio();
    });

    const actualizarFolio = () => {
      const nombres = grupo.get('nombres')?.value;
      const apellidos = grupo.get('apellidos')?.value;
      const fechaEmision = grupo.get('fechaEmision')?.value;
      const modeloCertificado = grupo.get('modeloCertificado')?.value;

      const folioCtrl = grupo.get('folioNumero');
      if (!folioCtrl) return;

      const folioActual = folioCtrl.value;

      const nuevoFolio = this.generarFolio(
        nombres,
        apellidos,
        fechaEmision,
        modeloCertificado,
        folioActual,
      );

      folioCtrl.setValue(nuevoFolio, { emitEvent: false });
    };

    grupo.get('nombres')?.valueChanges.subscribe(actualizarFolio);
    grupo.get('apellidos')?.valueChanges.subscribe(actualizarFolio);
    grupo.get('fechaEmision')?.valueChanges.subscribe(actualizarFolio);
    grupo.get('modeloCertificado')?.valueChanges.subscribe(actualizarFolio);

    return grupo;
  }

  agregarModelo(): void {
    if (this.modelos.length >= this.MAX_MODELOS) {
      alert(`Solo se permite un máximo de ${this.MAX_MODELOS} certificados.`);
      return;
    }

    const index = this.modelos.length;
    const primerModelo = this.modelos.at(0) as FormGroup;

    const nombres = primerModelo.get('nombres')?.value || '';
    const apellidos = primerModelo.get('apellidos')?.value || '';

    this.modelos.push(this.crearModeloForm(index, nombres, apellidos));
  }

  eliminarModelo(index: number): void {
    this.modeloFlags.splice(index, 1);

    if (this.modelos.length > 1) {
      this.modelos.removeAt(index);
      this.actualizarColorFondo();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // 🔥 Generar slugs QR en el frontend
    this.qrSlugs = this.modelos.controls.map((grupo) => {
      const g = grupo as FormGroup;
      return this.generarSlugQR(
        g.get('nombres')?.value,
        g.get('apellidos')?.value,
        g.get('temaDiplomado')?.value,
      );
    });

    this.mostrarQrSlugs = true;

    const payload = { items: this.modelos.value };

    this.service.generarPPTX(payload).subscribe({
      next: (archivo: Blob) => this.descargarArchivo(archivo),
      error: (err) => {
        console.error('ERROR BACKEND:', err);
        alert('Error al generar el PPTX. Revisa la consola.');
      },
    });
  }

  private descargarArchivo(blob: Blob): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CERTIFICADOS_${Date.now()}.pptx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    // ✅ Evento real de descarga (cliente)
    this.eventsService.track('PPTX_DOWNLOADED', this.modelos.length, 'WEB').subscribe({
      next: () => {},
      error: (e) => console.warn('Tracking falló (no crítico):', e),
    });
  }

  limpiarFormulario(): void {
    this.modeloFlags = [];

    this.modelos.clear();
    this.modelos.push(this.crearModeloForm(0));

    this.form.reset();

    this.qrSlugs = [];
    this.mostrarQrSlugs = false;

    this.renderer.setStyle(document.body, 'background-color', '#f3f4f6');
  }

  private calcularCreditos(horas: number): number {
    if (!horas || horas <= 0) return 0;

    // División exacta entre 16
    return Math.round((horas / 16) * 100) / 100; // 2 decimales
  }

  private generarFolio(
    nombres?: string | null,
    apellidos?: string | null,
    fechaEmision?: string | null,
    modeloCertificado?: string | null,
    folioActual?: string | null,
  ): string {
    if (!fechaEmision) return '';

    const year = new Date(fechaEmision).getFullYear();

    // 🟢 1. EXTRAER PREFIJO EXISTENTE (antes del primer " - ")
    let prefijo = '';
    if (folioActual && folioActual.includes(' - ')) {
      prefijo = folioActual.split(' - ')[0];
    }

    // Si no hay prefijo, lo dejamos vacío
    const base = prefijo ? `${prefijo} - ${year}` : ` - ${year}`;

    // 🚫 Caso especial: Universidad Azul
    if (modeloCertificado === 'UNIVERSIDAD_AZUL') {
      return base;
    }

    // 🟢 2. CALCULAR INICIALES
    const nombreSeguro = nombres ?? '';
    const apellidosSeguro = apellidos ?? '';

    const primerNombre = nombreSeguro.trim().charAt(0) || '';
    const partesApellidos = apellidosSeguro.trim().split(/\s+/);
    const primerApellido = partesApellidos[0]?.charAt(0) || '';
    const segundoApellido = partesApellidos[1]?.charAt(0) || '';

    const iniciales = (primerNombre + primerApellido + segundoApellido).toUpperCase();

    return `${base} - ${iniciales}`;
  }

  cerrarSesion(): void {
    /**
     * LOGOUT - NIVEL 8
     *
     * - Llama al backend
     * - Revoca sesión
     * - Borra cookie HttpOnly
     */
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('accessToken');
        this.router.navigate(['/login']);
      },
      error: () => {
        localStorage.removeItem('accessToken');
        this.router.navigate(['/login']);
      },
    });
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

login.html(front) :


<div class="login-wrapper">
  <div class="login-card">

    <h1>Iniciar sesión</h1>
    <p class="subtitle">Acceso restringido</p>

    <form [formGroup]="form" (ngSubmit)="onSubmit()">

    <div class="field">
      <label>Usuario</label>
      <input
        type="text"
        formControlName="usuario"
        placeholder="Ingrese su usuario"
      />
    </div>

    <div class="field">
      <label>Contraseña</label>
      <input
        type="password"
        formControlName="password"
        placeholder="Ingrese su contraseña"
      />
    </div>

    <button type="submit" class="btn-login">
      Iniciar sesión
    </button>

  </form>

</div>
</div >

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

login.ts(front) :


import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      usuario: [''],
      password: [''],
    });
  }

  onSubmit(): void {
    const request = {
      usuario: this.form.value.usuario,
      password: this.form.value.password,
    };

    this.authService.login(request).subscribe({
      next: (res) => {
        /**
         * LOGIN - NIVEL 7
         *
         * - AccessToken → se guarda (temporalmente) en localStorage
         * - RefreshToken → lo maneja el navegador vía cookie HttpOnly
         */
        if (res.success && res.data) {
          localStorage.setItem('accessToken', res.data.accessToken);

          // ❌ Ya NO guardamos refresh token
          // localStorage.removeItem('refreshToken');

          alert('Login exitoso');
          this.router.navigate(['/generar-diploma']);
        }
      },
      error: (err) => {
        alert(err.error.message);
      },
    });
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

auth.interceptor.ts(front) :


import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/logout');

  const accessToken = localStorage.getItem('accessToken');

  if (accessToken && !isAuthEndpoint) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 && !isAuthEndpoint && accessToken) {
        return authService.refreshToken().pipe(
          switchMap((res) => {
            if (!res.success || !res.data) {
              throw new Error('Refresh fallido');
            }

            localStorage.setItem('accessToken', res.data);

            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.data}` },
            });

            return next(retryReq);
          }),
          catchError((e) => {
            localStorage.removeItem('accessToken');
            router.navigate(['/login']);
            return throwError(() => e);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

auth.guard.ts(front) :


import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  const accessToken = localStorage.getItem('accessToken');

  // ✅ Token presente → permitir acceso
  if (accessToken) {
    return true;
  }

  // ❌ No hay token → redirigir a login
  router.navigate(['/login']);
  return false;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.routes.ts(front) :


import { Routes } from '@angular/router';
import { Formulario } from './pages/formulario/formulario';
import { LoginComponent } from './pages/login/login';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'generar-diploma',
    component: Formulario,
    canActivate: [authGuard], // 🔐 PROTEGIDO
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

interfaces.ts(front) :


/**
 * Contrato base de respuesta del backend.
 * Debe coincidir con ApiResponse<T> (backend).
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: any | null;
}

/**
 * Contrato de solicitud de login.
 */
export interface LoginRequest {
  usuario: string;
  password: string;
}

/**
 * Tokens de autenticación.
 * Debe coincidir con AuthTokensResponse (backend).
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

auth-service.ts (front) :


import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginRequest, ApiResponse, AuthTokens } from '../models/interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth/login';

  constructor(private http: HttpClient) {}

  /**
   * Login del usuario.
   *
   * NIVEL 4:
   * - Devuelve accessToken y refreshToken
   */
  login(request: LoginRequest): Observable<ApiResponse<AuthTokens>> {
    return this.http.post<ApiResponse<AuthTokens>>(
      'http://localhost:8080/auth/login',
      request,
      { withCredentials: true }, // 🔥 CLAVE para que el browser acepte la cookie
    );
  }

  /**
   * REFRESH TOKEN - NIVEL 7
   *
   * - NO se envía body
   * - El refresh token viaja automáticamente en cookie HttpOnly
   */
  refreshToken(): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      'http://localhost:8080/auth/refresh',
      {},
      { withCredentials: true }, // 🔑 OBLIGATORIO para cookies
    );
  }

  /**
   * LOGOUT - NIVEL 8
   *
   * - El backend borra cookie HttpOnly
   * - Revoca refresh tokens
   */
  logout(): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      'http://localhost:8080/auth/logout',
      {},
      { withCredentials: true },
    );
  }

  /**
   * Lee el role desde el accessToken (solo para UX).
   * OJO: esto NO reemplaza la seguridad del backend.
   */
  getRole(): 'ADMIN' | 'USER' | null {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role ?? null;
    } catch {
      return null;
    }
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

events-service.ts (front) :


import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventsService {
  private url = 'http://localhost:8082/api/events';

  constructor(private http: HttpClient) {}

  track(evento: string, items: number, origen: string): Observable<any> {
    return this.http.post(this.url, { evento, items, origen });
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

admin-service.ts (front) :


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/interfaces';

export interface UsuarioAdmin {
  id: number;
  usuario: string;
  role: 'ADMIN' | 'USER';
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private API_URL = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  /** Obtener todos los usuarios */
  listarUsuarios(): Observable<ApiResponse<UsuarioAdmin[]>> {
    return this.http.get<ApiResponse<UsuarioAdmin[]>>(this.API_URL);
  }

  /** Crear usuario */
  crearUsuario(data: {
    usuario: string;
    password: string;
    role: 'ADMIN' | 'USER';
  }): Observable<ApiResponse<UsuarioAdmin>> {
    return this.http.post<ApiResponse<UsuarioAdmin>>(this.API_URL, data);
  }

  /** Eliminar usuario */
  eliminarUsuario(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.API_URL}/${id}`);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

admin-guard.ts (front) : 


import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';

/**
 * ADMIN GUARD
 *
 * - Evita que usuarios USER entren al panel admin
 * - Esto es SOLO UX
 * - El backend sigue siendo la fuente de verdad
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const role = authService.getRole();

  if (role === 'ADMIN') {
    return true;
  }

  // ❌ No autorizado
  router.navigate(['/generar-diploma']);
  return false;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.routes.ts (front) :


import { Routes } from '@angular/router';
import { Formulario } from './pages/formulario/formulario';
import { LoginComponent } from './pages/login/login';
import { authGuard } from './guards/auth.guard';
import { AdminComponent } from './pages/admin/admin';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'generar-diploma',
    component: Formulario,
    canActivate: [authGuard], // 🔐 PROTEGIDO
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [adminGuard], // 🔐 DOBLE FILTRO
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

admin.html (front) :


<div class="admin-container">
  <h1>Panel de Administración</h1>
  <p class="subtitle">Gestión de usuarios del sistema</p>

  <!-- FORMULARIO -->
  <div class="card">
    <h2>Crear usuario</h2>

    <form [formGroup]="form" (ngSubmit)="crearUsuario()">
      <div class="field">
        <label>Usuario</label>
        <input type="text" formControlName="usuario" />
      </div>

      <div class="field">
        <label>Contraseña</label>
        <input type="password" formControlName="password" />
      </div>

      <div class="field">
        <label>Rol</label>
        <select formControlName="role">
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>

      <button type="submit">Crear</button>
    </form>
  </div>

  <!-- LISTA -->
  <div class="card">
    <h2>Usuarios registrados</h2>

    <table>
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Rol</th>
          <th>Acción</th>
        </tr>
      </thead>

      <tbody>
        <tr *ngFor="let u of usuarios">
          <td>{{ u.usuario }}</td>
          <td>{{ u.role }}</td>
          <td>
            <button class="danger" (click)="eliminarUsuario(u.id)">Eliminar</button>
            <button class="info" (click)="abrirTablaDescargas(u)">Tabla de descargas</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p *ngIf="cargando">Cargando...</p>
  </div>
</div>


<!-- TABLA DESCARGAS -->
<div class="card" *ngIf="usuarioSeleccionado">
  <h2>Descargas - {{ usuarioSeleccionado.usuario }}</h2>

  <div class="filters">
    <div class="field">
      <label>Desde</label>
      <input type="date" [(ngModel)]="fromDate" />
    </div>

    <div class="field">
      <label>Hasta</label>
      <input type="date" [(ngModel)]="toDate" />
    </div>

    <button type="button" (click)="cargarDescargas()">Filtrar</button>
    <button type="button" class="muted" (click)="cerrarTablaDescargas()">Cerrar</button>
  </div>

  <p *ngIf="cargandoDescargas">Cargando descargas...</p>

  <table *ngIf="!cargandoDescargas">
    <thead>
      <tr>
        <th>Usuario</th>
        <th>Fecha</th>
        <th>Hora</th>
      </tr>
    </thead>

    <tbody>
      <tr *ngFor="let d of descargas">
        <td>{{ d.usuario }}</td>
        <td>{{ d.createdAt | date: 'dd/MM/yyyy' }}</td>
        <td>{{ d.createdAt | date: 'HH:mm:ss' }}</td>
      </tr>
    </tbody>
  </table>

  <p *ngIf="!cargandoDescargas && descargas.length === 0">Sin descargas en ese rango.</p>
</div>

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

admin.ts (front) :


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService, UsuarioAdmin } from '../../services/admin-service';
import { DownloadEventRow, EventsAdminService } from '../../services/events-admin-service';

// @Component({
//   selector: 'app-admin',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './admin.html',
//   styleUrl: './admin.css',
// })
// export class AdminComponent implements OnInit {
//   usuarios: UsuarioAdmin[] = [];
//   form: FormGroup;
//   cargando = false;

//   constructor(
//     private adminService: AdminService,
//     private fb: FormBuilder,
//   ) {
//     this.form = this.fb.group({
//       usuario: ['', [Validators.required, Validators.minLength(5)]],
//       password: ['', [Validators.required, Validators.minLength(8)]],
//       role: ['USER', Validators.required],
//     });
//   }

//   ngOnInit(): void {
//     this.cargarUsuarios();
//   }

//   cargarUsuarios(): void {
//     this.cargando = true;

//     this.adminService.listarUsuarios().subscribe({
//       next: (res) => {
//         if (res.success && res.data) {
//           this.usuarios = res.data;
//         }
//         this.cargando = false;
//       },
//       error: () => {
//         alert('Error al cargar usuarios');
//         this.cargando = false;
//       },
//     });
//   }

//   crearUsuario(): void {
//     if (this.form.invalid) {
//       this.form.markAllAsTouched();
//       return;
//     }

//     this.adminService.crearUsuario(this.form.value).subscribe({
//       next: () => {
//         this.form.reset({ role: 'USER' });
//         this.cargarUsuarios();
//       },
//       error: (err) => {
//         alert(err.error?.message ?? 'Error al crear usuario');
//       },
//     });
//   }

//   eliminarUsuario(id: number): void {
//     if (!confirm('¿Eliminar este usuario?')) return;

//     this.adminService.eliminarUsuario(id).subscribe({
//       next: () => this.cargarUsuarios(),
//       error: () => alert('No se pudo eliminar el usuario'),
//     });
//   }
// }

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent implements OnInit {
  usuarios: UsuarioAdmin[] = [];
  form: FormGroup;
  cargando = false;

  // ✅ descargas
  usuarioSeleccionado: UsuarioAdmin | null = null;
  descargas: DownloadEventRow[] = [];
  cargandoDescargas = false;

  // filtros (YYYY-MM-DD)
  fromDate: string = '';
  toDate: string = '';

  constructor(
    private adminService: AdminService,
    private eventsAdminService: EventsAdminService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['USER', Validators.required],
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;

    this.adminService.listarUsuarios().subscribe({
      next: (res) => {
        if (res.success && res.data) this.usuarios = res.data;
        this.cargando = false;
      },
      error: () => {
        alert('Error al cargar usuarios');
        this.cargando = false;
      },
    });
  }

  crearUsuario(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.adminService.crearUsuario(this.form.value).subscribe({
      next: () => {
        this.form.reset({ role: 'USER' });
        this.cargarUsuarios();
      },
      error: (err) => alert(err.error?.message ?? 'Error al crear usuario'),
    });
  }

  eliminarUsuario(id: number): void {
    if (!confirm('¿Eliminar este usuario?')) return;

    this.adminService.eliminarUsuario(id).subscribe({
      next: () => this.cargarUsuarios(),
      error: () => alert('No se pudo eliminar el usuario'),
    });
  }

  // ==========================
  // ✅ TABLA DE DESCARGAS
  // ==========================
  abrirTablaDescargas(u: UsuarioAdmin): void {
    this.usuarioSeleccionado = u;

    // por defecto (si quieres): hoy -> hoy
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');

    this.fromDate = `${yyyy}-${mm}-${dd}`;
    this.toDate = `${yyyy}-${mm}-${dd}`;

    this.cargarDescargas();
  }

  cerrarTablaDescargas(): void {
    this.usuarioSeleccionado = null;
    this.descargas = [];
    this.fromDate = '';
    this.toDate = '';
  }

  cargarDescargas(): void {
    if (!this.usuarioSeleccionado) return;

    this.cargandoDescargas = true;

    this.eventsAdminService
      .getDownloads(this.usuarioSeleccionado.usuario, this.fromDate, this.toDate)
      .subscribe({
        next: (res) => {
          this.descargas = res.success && res.data ? res.data : [];
          this.cargandoDescargas = false;
        },
        error: () => {
          alert('No se pudo cargar la tabla de descargas');
          this.cargandoDescargas = false;
        },
      });
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

events-admin-service.ts (front) :


// events-admin-service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/interfaces';

export interface DownloadEventRow {
  usuario: string;
  createdAt: string; // ISO (viene del backend)
}

@Injectable({ providedIn: 'root' })
export class EventsAdminService {
  private url = 'http://localhost:8082/api/events/admin/downloads';

  constructor(private http: HttpClient) {}

  getDownloads(
    usuario: string,
    from?: string,
    to?: string,
  ): Observable<ApiResponse<DownloadEventRow[]>> {
    let params = new HttpParams().set('usuario', usuario);

    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return this.http.get<ApiResponse<DownloadEventRow[]>>(this.url, { params });
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

AuthController.java (back) :


package com.service.microservice_auth.controllers;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.service.microservice_auth.dtos.ApiResponse;
import com.service.microservice_auth.dtos.AuthTokensResponse;
import com.service.microservice_auth.dtos.LoginRequest;
import com.service.microservice_auth.security.JwtService;
import com.service.microservice_auth.services.RefreshTokenService;
import com.service.microservice_auth.services.UsuarioService;

import jakarta.validation.Valid;

/**
 * Controlador de autenticación.
 * 
 * NIVEL 2:
 * - Usa DTOs explícitos
 * - Usa ApiResponse como formato estándar
 * - NO aplica hashing ni tokens todavía
 */
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RestController
@RequestMapping("/auth")
public class AuthController {

        private final JwtService jwtService;
        private final UsuarioService usuarioService;
        private final RefreshTokenService refreshTokenService;

        public AuthController(
                        JwtService jwtService,
                        UsuarioService usuarioService,
                        RefreshTokenService refreshTokenService) {
                this.jwtService = jwtService;
                this.usuarioService = usuarioService;
                this.refreshTokenService = refreshTokenService;
        }

        /**
         * LOGIN - NIVEL 7
         * 
         * - AccessToken → se devuelve en el body
         * - RefreshToken → se guarda en COOKIE HttpOnly (NO accesible desde JS)
         */
        @PostMapping("/login")
        public ResponseEntity<ApiResponse<?>> login(@Valid @RequestBody LoginRequest request) {

                boolean success = usuarioService.login(
                                request.getUsuario(),
                                request.getPassword());

                if (!success) {
                        return ResponseEntity.status(401)
                                        .body(ApiResponse.error("Usuario o contraseña incorrectos", null));
                }

                // 🔐 Generación de tokens
                String role = usuarioService.getRoleByUsername(request.getUsuario()).name();
                String accessToken = jwtService.generateAccessToken(request.getUsuario(), role);
                String refreshToken = jwtService.generateRefreshToken(request.getUsuario());

                // 💾 Guardar refresh token hasheado
                refreshTokenService.save(request.getUsuario(), refreshToken);

                // 🍪 COOKIE HttpOnly para refresh token
                // JavaScript NO puede leerla (protección XSS)
                ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                                .httpOnly(true) // 🔒 NO accesible desde JS
                                .secure(false) // ⚠️ true en PRODUCCIÓN (HTTPS)
                                .path("/auth/refresh") // esto significa que la cookie se enviará en TODAS las rutas, no
                                                       // solo /auth/refresh, para que funcione en cross-site
                                .maxAge(7 * 24 * 60 * 60) // 7 días
                                .sameSite("Lax") // Protege contra CSRF pero permite navegación normal, y será None con
                                                 // secure(true) en producción, para que funcione en cross-site
                                .build();

                // ❗ IMPORTANTE:
                // Ya NO enviamos refreshToken en el body
                AuthTokensResponse response = new AuthTokensResponse(accessToken, null);

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                                .body(ApiResponse.ok("Login exitoso", response));
        }

        /**
         * REFRESH TOKEN - NIVEL 7
         * 
         * - El refresh token se lee SOLO desde cookie HttpOnly
         * - El frontend NO envía nada
         * - Se rota el refresh token
         */
        @PostMapping("/refresh")
        public ResponseEntity<ApiResponse<?>> refresh(
                        @CookieValue(name = "refreshToken", required = false) String refreshToken) {

                // ❌ No hay cookie
                if (refreshToken == null) {
                        return ResponseEntity.status(401)
                                        .body(ApiResponse.error("Refresh token no encontrado", null));
                }

                // ❌ Token inválido o no es refresh
                if (!jwtService.isTokenValid(refreshToken)
                                || !jwtService.isRefreshToken(refreshToken)
                                || !refreshTokenService.isValid(refreshToken)) {
                        return ResponseEntity.status(401)
                                        .body(ApiResponse.error("Refresh token inválido", null));
                }

                String username = jwtService.getUsername(refreshToken);

                // ✅ role desde BD (fuente de verdad)
                String role = usuarioService.getRoleByUsername(username).name();

                String newAccessToken = jwtService.generateAccessToken(username, role);
                String newRefreshToken = jwtService.generateRefreshToken(username);
                
                // ✅ REVOCAR refresh anterior y GUARDAR el nuevo
                refreshTokenService.revokeAll(username);
                refreshTokenService.save(username, newRefreshToken);

                // 🍪 Nueva cookie (rotación)
                ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", newRefreshToken)
                                .httpOnly(true)
                                .secure(false) // true en PROD
                                .path("/auth/refresh") // esto significa que la cookie se enviará en TODAS las rutas, no
                                                       // solo /auth/refresh, para que funcione en cross-site
                                .maxAge(7 * 24 * 60 * 60)
                                .sameSite("Lax") // Protege contra CSRF pero permite navegación normal, y será None con
                                                 // secure(true) en producción, para que funcione en cross-site
                                .build();

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                                .body(ApiResponse.ok("Access token renovado", newAccessToken));
        }

        /**
         * LOGOUT REAL - NIVEL 8
         * 
         * - Revoca refresh tokens en BD
         * - Borra cookie HttpOnly
         */
        @PostMapping("/logout")
        public ResponseEntity<ApiResponse<?>> logout(
                        @CookieValue(name = "refreshToken", required = false) String refreshToken) {

                if (refreshToken != null && jwtService.isTokenValid(refreshToken)) {
                        String usuario = jwtService.getUsername(refreshToken);
                        refreshTokenService.revokeAll(usuario);
                }

                // 🍪 Borrar cookie
                ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                                .httpOnly(true)
                                .secure(false)
                                .path("/auth/refresh")
                                .maxAge(0)
                                .build();

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                                .body(ApiResponse.ok("Logout exitoso", null));
        }

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7

Usuario.java (back) :


package com.service.microservice_auth.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 15)
    private String usuario;

    @Column(nullable = false, length = 50)
    private String password;

    /**
     * NIVEL 9.2 - ROLES
     * Rol del usuario (ADMIN o USER)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Role role = Role.USER;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7

UsuarioRepository.java(back) :


package com.service.microservice_auth.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.service.microservice_auth.models.Role;
import com.service.microservice_auth.models.Usuario;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsuario(String usuario);

    // útil para validaciones rápidas de rol
    Optional<Usuario> findByUsuarioAndRole(String usuario, Role role);

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7

UsuarioService.java(back) :


package com.service.microservice_auth.services;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.service.microservice_auth.models.Role;
import com.service.microservice_auth.models.Usuario;
import com.service.microservice_auth.repositories.UsuarioRepository;

/**
 * Servicio de dominio para usuarios.
 * 
 * NIVEL 3:
 * - Comparación segura de contraseñas con BCrypt
 * - Nunca compara texto plano con texto plano
 */
@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            BCryptPasswordEncoder passwordEncoder) {

        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Valida credenciales del usuario.
     *
     * @param usuario  username ingresado
     * @param password contraseña en texto plano (input)
     * @return true si las credenciales son válidas
     */
    public boolean login(String usuario, String password) {

        Optional<Usuario> usuarioDB = usuarioRepository.findByUsuario(usuario);

        if (usuarioDB.isEmpty()) { // significa que si usuarioDB no tiene un valor dentro entonces return false
            return false;
        }

        // return usuarioDB.get().getPassword().equals(password);
        // BCrypt compara texto plano vs hash almacenado
        return passwordEncoder.matches( // qué hace matches? compara el texto plano con el hash almacenado
                password,
                usuarioDB.get().getPassword());
    }

    /**
     * NIVEL 9.2 - ROLES
     * Obtiene el rol del usuario (para inyectarlo en el JWT).
     */
    public Role getRoleByUsername(String usuario) {
        return usuarioRepository.findByUsuario(usuario)
                .map(Usuario::getRole)
                .orElseThrow(() -> new RuntimeException("Usuario no existe"));
    }

    // ==========================
    // CRUD ADMIN (para controller)
    // ==========================

    public List<Usuario> listAll() {
        return usuarioRepository.findAll();
    }

    public Usuario createUser(String usuario, String rawPassword, Role role) {
        Usuario u = new Usuario();
        u.setUsuario(usuario);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setRole(role == null ? Role.USER : role);
        return usuarioRepository.save(u);
    }

    public Usuario updateUser(Long id, String rawPassword, Role role) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no existe"));

        if (rawPassword != null && !rawPassword.isBlank()) {
            u.setPassword(passwordEncoder.encode(rawPassword));
        }
        if (role != null) {
            u.setRole(role);
        }
        return usuarioRepository.save(u);
    }

    public void deleteUser(Long id) {
        usuarioRepository.deleteById(id);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

LoginRequest.java (back) :


package com.service.microservice_auth.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO que representa la solicitud de login.
 * NIVEL 2:
 * - Validación declarativa (fail fast)
 * - Aún NO aplica hashing ni tokens
 */
public class LoginRequest {

  @NotBlank(message = "El campo 'usuario' no puede estar vacío")
  @Size(min = 5, max = 15, message = "El campo 'usuario' debe tener entre 5 y 15 caracteres")
  private String usuario;

  @NotBlank(message = "El campo 'password' no puede estar vacío")
  @Size(min = 8, max = 50, message = "El campo 'password' debe tener entre 8 y 50 caracteres")
  private String password;

  public String getUsuario() {
    return usuario;
  }

  public void setUsuario(String usuario) {
    this.usuario = usuario;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

LoginResponse.ts(back) :


package com.service.microservice_auth.dtos;

/**
 * DTO de respuesta estándar para el login.
 * 
 * En niveles posteriores este DTO podrá extenderse
 * (token, roles, expiración, etc) sin romper el frontend.
 */
public class LoginResponse {

  private boolean success;
  private String message;

  public LoginResponse(boolean success, String message) {
    this.success = success;
    this.message = message;
  }

  public boolean isSuccess() {
    return success;
  }

  public String getMessage() {
    return message;
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

GlobalExceptionHandler.java(back) :


package com.service.microservice_auth.handlers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.service.microservice_auth.dtos.ApiResponse;

/**
 * Manejador global de excepciones.
 * 
 * NIVEL 2:
 * - Centraliza errores
 * - Devuelve ApiResponse estándar
 * - Evita lógica de errores en los controllers
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

  /**
   * Maneja errores de validación (@Valid).
   * 
   * Se ejecuta automáticamente cuando un DTO
   * no cumple las reglas declaradas.
   */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiResponse<?>> handleValidation(MethodArgumentNotValidException ex) {

  Map < String, String > errors = new HashMap <> ();

  for (FieldError err : ex.getBindingResult().getFieldErrors()) {
    errors.put(err.getField(), err.getDefaultMessage());
  }

  return ResponseEntity.badRequest().body(
    ApiResponse.error("Datos inválidos", errors)
  );
}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

ApiResponse.java(back) :


package com.service.microservice_auth.dtos;

/**
 * Respuesta estándar del API.
 * 
 * NIVEL 2 - PASO 3:
 * - Unifica TODAS las respuestas del backend
 * - Facilita escalabilidad y reutilización
 */
public class ApiResponse<T> {

  private boolean success;
  private String message;
  private T data;
  private Object errors;

  public ApiResponse(boolean success, String message, T data, Object errors) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.errors = errors;
  }

  public boolean isSuccess() { return success; }
  public String getMessage() { return message; }
  public T getData() { return data; }
  public Object getErrors() { return errors; }

  // Helpers estáticos (muy útiles)
  public static<T> ApiResponse<T> ok(String message, T data) {
    return new ApiResponse <> (true, message, data, null);
  }

  public static ApiResponse<?> error(String message, Object errors) {
    return new ApiResponse <> (false, message, null, errors);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

SecurityConfig.java(back) :


package com.service.microservice_auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;

import com.service.microservice_auth.security.JwtAuthFilter;

/**
 * Configuración de seguridad básica.
 * 
 * NIVEL 3:
 * - Provee BCryptPasswordEncoder como Bean
 * - Aún NO usa Spring Security (filtros, JWT, etc)
 */
@Configuration
public class SecurityConfig {

  /**
   * BCrypt con fuerza por defecto (10).
   * 
   * Suficiente para la mayoría de sistemas.
   */
  @Bean
  public BCryptPasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  /**
   * Registro manual del filtro JWT.
   */
  @Bean
  public FilterRegistrationBean<JwtAuthFilter> jwtFilter(JwtAuthFilter filter) {
    FilterRegistrationBean < JwtAuthFilter > registration = new FilterRegistrationBean <> ();
    registration.setFilter(filter);
    registration.addUrlPatterns("/*");
    registration.setOrder(1);
    return registration;
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

JwtService.java(back) :


package com.service.microservice_auth.security;

import java.util.Date;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;

/**
 * Servicio encargado de generar y gestionar JWT.
 * 
 * NIVEL 4:
 * - Access Token (vida corta)
 * - Refresh Token (vida larga)
 */
@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-expiration-ms}") long accessExpirationMs,
            @Value("${jwt.refresh-expiration-ms}") long refreshExpirationMs) {

        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessExpirationMs = accessExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    /**
     * Genera un ACCESS TOKEN.
     * 
     * - Se usa para acceder a endpoints protegidos
     * - Vida corta
     */
    public String generateAccessToken(String username, String role) {
        return generateToken(username, accessExpirationMs, "ACCESS", role);
    }

    /**
     * Genera un REFRESH TOKEN.
     * 
     * - Se usa solo para renovar el access token
     * - Vida larga
     */
    public String generateRefreshToken(String username) {
        // refresh NO necesita role, solo identidad y type
        return generateToken(username, refreshExpirationMs, "REFRESH", null);
    }

    /**
     * Método interno para generar tokens JWT.
     */
    private String generateToken(String username, long expirationMs, String type, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        var builder = Jwts.builder()
                .setId(UUID.randomUUID().toString())
                .setSubject(username)
                .claim("type", type)
                .setIssuedAt(now)
                .setExpiration(expiryDate);

        // ✅ Role SOLO en access token
        if (role != null && "ACCESS".equals(type)) {
            builder = builder.claim("role", role);
        }

        return builder
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extrae role del ACCESS token.
     */
    public String getRole(String token) {
        Claims claims = getClaims(token);
        Object role = claims.get("role");
        return role == null ? null : role.toString();
    }

    /**
     * Métodos de validación JWT.
     */
    public boolean isTokenValid(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Extrae los claims del token.
     */
    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Valida que el token sea de tipo ACCESS.
     */
    public boolean isAccessToken(String token) {
        Claims claims = getClaims(token);
        return "ACCESS".equals(claims.get("type"));
    }

    /**
     * Extrae el username (subject).
     */
    public String getUsername(String token) {
        return getClaims(token).getSubject();
    }

    public boolean isRefreshToken(String token) {
        Claims claims = getClaims(token);
        return "REFRESH".equals(claims.get("type"));
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

AuthTokensResponse.java(back) :


package com.service.microservice_auth.dtos;

/**
 * DTO que representa los tokens de autenticación.
 * 
 * NIVEL 4:
 * - accessToken: se usa para acceder a recursos
 * - refreshToken: se usa para renovar el access token
 */
public class AuthTokensResponse {

  private String accessToken;
  private String refreshToken;

  public AuthTokensResponse(String accessToken, String refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  public String getAccessToken() {
    return accessToken;
  }

  public String getRefreshToken() {
    return refreshToken;
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

JwtAuthFilter.java (back) :


package com.service.microservice_auth.security;

import java.io.IOException;

import org.springframework.stereotype.Component;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Filtro de autorización JWT.
 * 
 * NIVEL 5:
 * - Valida Access Token
 * - Rechaza tokens inválidos
 * - No usa Spring Security aún
 */
@Component
public class JwtAuthFilter implements Filter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String origin = req.getHeader("Origin");
        if ("http://localhost:4200".equals(origin)) {
            res.setHeader("Access-Control-Allow-Origin", origin);
            res.setHeader("Vary", "Origin");
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
            res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        }

        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            res.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        String path = req.getRequestURI();

        // 🔓 Endpoints públicos
        if (path.startsWith("/auth")) {
            chain.doFilter(request, response);
            return;
        }

        // (1) Validación JWT access token (igual que ya tienes)
        String authHeader = req.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        String token = authHeader.substring(7);

        if (!jwtService.isTokenValid(token) || !jwtService.isAccessToken(token)) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // (2) ✅ Autorización por rol (solo para rutas específicas)
        if (path.startsWith("/api/users")) {
            String role = jwtService.getRole(token);
            if (!"ADMIN".equals(role)) {
                res.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
                return;
            }
        }

        // Token válido y autorizado → continuar
        chain.doFilter(request, response);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

RefreshTokenRequest.java(back) :


package com.service.microservice_auth.dtos;

import jakarta.validation.constraints.NotBlank;

public class RefreshTokenRequest {

  @NotBlank
  private String refreshToken;

  public String getRefreshToken() {
    return refreshToken;
  }

  public void setRefreshToken(String refreshToken) {
    this.refreshToken = refreshToken;
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

RefreshToken.java (back) :


package com.service.microservice_auth.models;

import jakarta.persistence.*;
import lombok.Data;

/**
 * ENTIDAD REFRESH TOKEN - NIVEL 8
 * 
 * - Guarda SOLO hash del refresh token
 * - Permite revocar sesiones
 * - Base para logout real
 */
@Data
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Usuario dueño del token
    @Column(nullable = false)
    private String usuario;

    // Hash del refresh token (nunca el token real)
    @Column(nullable = false, length = 255)
    private String tokenHash;

    // Permite revocación
    @Column(nullable = false)
    private boolean revoked = false;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

RefreshTokenRepository.java (back) :


package com.service.microservice_auth.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.service.microservice_auth.models.RefreshToken;

import java.util.Optional;

/**
 * REPOSITORIO REFRESH TOKEN - NIVEL 8
 */
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHashAndRevokedFalse(String tokenHash);

    void deleteByUsuario(String usuario);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

RefreshTokenService.java (back) :


package com.service.microservice_auth.services;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import org.springframework.stereotype.Service;

import com.service.microservice_auth.models.RefreshToken;
import com.service.microservice_auth.repositories.RefreshTokenRepository;

import org.springframework.transaction.annotation.Transactional;

/**
 * SERVICIO REFRESH TOKEN - NIVEL 8
 * 
 * - Hash seguro del refresh token
 * - Validación
 * - Revocación
 */
@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repository;

    public RefreshTokenService(RefreshTokenRepository repository) {
        this.repository = repository;
    }

    /**
     * Guarda refresh token hasheado.
     */
    public void save(String usuario, String refreshToken) {
        RefreshToken rt = new RefreshToken();
        rt.setUsuario(usuario);
        rt.setTokenHash(hash(refreshToken));
        rt.setRevoked(false);

        repository.save(rt);
    }

    /**
     * Valida si el refresh token es válido y no revocado.
     */
    public boolean isValid(String refreshToken) {
        return repository
                .findByTokenHashAndRevokedFalse(hash(refreshToken))
                .isPresent();
    }

    /**
     * Revoca TODOS los refresh tokens de un usuario (logout).
     */
    @Transactional // Para asegurar que la operación de revocación es atómica
    public void revokeAll(String usuario) {
        repository.deleteByUsuario(usuario);
    }

    /**
     * Hash SHA-256 del token.
     */
    private String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encoded = digest.digest(token.getBytes(StandardCharsets.UTF_8));

            StringBuilder hex = new StringBuilder();
            for (byte b : encoded) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();

        } catch (Exception e) {
            throw new RuntimeException("Error hashing token");
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

UsuarioAdminController.java (back) :


package com.service.microservice_auth.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.service.microservice_auth.dtos.ApiResponse;
import com.service.microservice_auth.dtos.CreateUserRequest;
import com.service.microservice_auth.dtos.UpdateUserRequest;
import com.service.microservice_auth.models.Usuario;
import com.service.microservice_auth.services.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UsuarioAdminController {

    private final UsuarioService usuarioService;

    public UsuarioAdminController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /** ADMIN: listar usuarios */
    @GetMapping
    public ApiResponse<List<Usuario>> list() {
        return ApiResponse.ok("Usuarios", usuarioService.listAll());
    }

    /** ADMIN: crear usuario */
    @PostMapping
    public ApiResponse<Usuario> create(
            @RequestBody @Valid CreateUserRequest req) {

        Usuario u = usuarioService.createUser(
                req.getUsuario(),
                req.getPassword(),
                req.getRole());

        return ApiResponse.ok("Usuario creado", u);
    }

    /** ADMIN: actualizar usuario */
    @PutMapping("/{id}")
    public ApiResponse<Usuario> update(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest req) {

        Usuario u = usuarioService.updateUser(
                id,
                req.getPassword(),
                req.getRole());

        return ApiResponse.ok("Usuario actualizado", u);
    }

    /** ADMIN: eliminar usuario */
    @DeleteMapping("/{id}")
    public ApiResponse<?> delete(@PathVariable Long id) {
        usuarioService.deleteUser(id);
        return ApiResponse.ok("Usuario eliminado", null);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

CreateUserRequest.java (back) :


package com.service.microservice_auth.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import com.service.microservice_auth.models.Role;

public class CreateUserRequest {

    @NotBlank
    @Size(min = 5, max = 15)
    private String usuario;

    @NotBlank
    @Size(min = 8, max = 50)
    private String password;

    private Role role = Role.USER;

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

UpdateUserRequest.java (back) :


package com.service.microservice_auth.dtos;

import com.service.microservice_auth.models.Role;

public class UpdateUserRequest {

    private String password;
    private Role role;

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Role.java (back) :


package com.service.microservice_auth.models;

/**
 * Roles del sistema.
 * - ADMIN: gestiona usuarios
 * - USER: genera PPTX (consumirá FastAPI)
 */
public enum Role {
    ADMIN,
    USER
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

application.properties (back) :


spring.application.name = microservice - auth

# ===============================
# CONFIGURACIÓN DEL SERVIDOR
# ===============================
server.port = 8080

# ===============================
# DATASOURCE - MYSQL
# ===============================
spring.datasource.url = jdbc: mysql://localhost:3306/ipde
spring.datasource.username = root
spring.datasource.password = wa1000201002
spring.datasource.driver - class- name=com.mysql.cj.jdbc.Driver

# ===============================
# JPA / HIBERNATE
# ===============================
spring.jpa.hibernate.ddl - auto=none
spring.jpa.show - sql=true
spring.jpa.properties.hibernate.format_sql = true

# Dialecto recomendado para MySQL
spring.jpa.database - platform=org.hibernate.dialect.MySQLDialect

# Deshabilitar Open Session in View para evitar problemas de LazyInitializationException
spring.jpa.open -in -view=false

# ===============================
# JWT CONFIGURATION
# ===============================

# Clave para firmar tokens
jwt.secret=mi_clave_secreta_super_segura_2026

# Access token: 15 minutos
jwt.access-expiration-ms=900000

# Refresh token: 7 días
jwt.refresh-expiration-ms=604800000

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

base de datos - ipde :


CREATE DATABASE ipde; 
USE ipde;

CREATE TABLE usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL
);

INSERT INTO usuarios (usuario, password)
VALUES ('admin', '12345');

UPDATE USUARIOS
SET PASSWORD = '12345678' 
WHERE ID = 1;

SELECT * FROM usuarios;

------------------------------------------------------
-- segundo cambio por integración de BCRYPT en back --
------------------------------------------------------

ALTER TABLE usuarios
MODIFY password VARCHAR(255) NOT NULL;

UPDATE usuarios 
SET PASSWORD = '$2a$12$eh.IQT6XJSYFCQUz9oG2QuUZ3ywHKSojcwVRPQg6QkjKh2mY6oh2C'
WHERE ID = 1;

------------------------------------------------------
----------- tercer cambio para el nivel 8 ------------
------------------------------------------------------

-- token_hash → NUNCA guardamos el token real
-- revoked → control de sesión
-- Escalable a múltiples dispositivos

SELECT * FROM refresh_tokens;

CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

------------------------------------------------------
----------- cuarto cambio para el nivel 9 ------------
------------------------------------------------------

ALTER TABLE refresh_tokens
ADD COLUMN device_info VARCHAR(255),
ADD COLUMN ip_address VARCHAR(45),
ADD COLUMN expires_at TIMESTAMP;

------------------------------------------------------
---------- quinto cambio para el nivel 9.1 -----------
------------------------------------------------------

SELECT * FROM usage_events;

CREATE TABLE usage_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    usuario VARCHAR(50) NOT NULL,
    evento VARCHAR(50) NOT NULL,

    items_count INT NOT NULL,

    origen VARCHAR(20) DEFAULT 'WEB',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_usuario_fecha (usuario, created_at),
    INDEX idx_evento_fecha (evento, created_at)
);

------------------------------------------------------
----------- quinto cambio para el nivel 10 -----------
------------------------------------------------------

ALTER TABLE usuarios
ADD COLUMN role VARCHAR(10) NOT NULL DEFAULT 'USER';

-- Tu usuario admin actual (id=1) debe ser ADMIN
UPDATE usuarios
SET role = 'ADMIN'
WHERE id = 1;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

main.py (back "de formulario") :


from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE
from pptx.util import Cm
from io import BytesIO
import unicodedata
import re
import os
import json
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI
from copy import deepcopy
from typing import List, Tuple
import qrcode
import requests
from fastapi import Header
from jose import jwt, JWTError
from fastapi import Depends
import logging

logger = logging.getLogger("auth")

# -------------------------------------------------
# CONFIGURACIÓN GENERAL
# -------------------------------------------------

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI(title="Certificados API", version="2.3.0")

# Modelos disponibles (carpetas dentro de app/templates)
# IMPORTANTE: Deben coincidir con los valores enviados desde el frontend:
# - INSTITUTO
# - UNIVERSIDAD_2QRS
# - UNIVERSIDAD_AZUL
# - COLEGIO_ABOGADOS_CALLAO
MODELO_FOLDER_MAP = {
    "INSTITUTO": "instituto",
    "UNIVERSIDAD_2QRS": "universidad_2qrs",
    "UNIVERSIDAD_AZUL": "universidad_azul",
    "COLEGIO_ABOGADOS_CALLAO": "colegio_de_abogados_del_callao",
}

# Modelos que usan formato de fecha largo (dd de Mes del yyyy)
MODELOS_FECHA_LARGA = {
    "INSTITUTO",
    "UNIVERSIDAD_AZUL",
    "COLEGIO_ABOGADOS_CALLAO",
}


# Nombre de archivo de plantilla por tipo (dentro de cada carpeta de modelo)
TEMPLATE_FILENAME_MAP = {
    "DIPLOMADO": "plantilla_diplomado.pptx",
    "PROGRAMA DE ESPECIALIZACIÓN": "plantilla_programa_de_especializacion.pptx",
    "CURSO": "plantilla_curso.pptx",
    "CURSO_DE_CAPACITACION": "plantilla_curso_de_capacitacion.pptx",
    "CURSO_DE_ACTUALIZACION": "plantilla_curso_de_actualizacion.pptx",
}

# Nº de módulos por tipo
MODULOS_COUNT = {
    "DIPLOMADO": 8,
    "PROGRAMA DE ESPECIALIZACIÓN": 8,
    "CURSO": 5,
    "CURSO_DE_CAPACITACION": 5,
    "CURSO_DE_ACTUALIZACION": 5,
}

# Cache en memoria: (tipo, tema) -> módulos
MODULOS_CACHE: dict[Tuple[str, str], List[str]] = {}


# -------------------------------------------------
# CLIENTE PARA MICROSERVICE EVENTS
# -------------------------------------------------

"""
Cliente HTTP para registrar eventos de uso.

Este FastAPI NO guarda eventos directamente en BD.
Delegamos el tracking al microservice-events para:
- desacoplar métricas del negocio principal
- permitir escalabilidad
- centralizar estadísticas
"""


EVENTS_SERVICE_URL = "http://localhost:8082/api/events"


# -------------------------------------------------
# UTILIDADES
# -------------------------------------------------

JWT_SECRET = os.getenv("JWT_SECRET", "mi_clave_secreta_super_segura_2026")
JWT_ALG = "HS256"

def validate_access_token(authorization: str = Header(...)) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token inválido")

    token = authorization.replace("Bearer ", "").strip()

    try:
        claims = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except JWTError:
         # ⬇️ LOG SOLO EN DEBUG (no ensucia logs normales)
        logger.debug("Access token expirado o inválido")
        raise HTTPException(status_code=401, detail="Token expirado o inválido")

    if claims.get("type") != "ACCESS":
        raise HTTPException(status_code=401, detail="Token no es ACCESS")

    # opcional: devolver username si lo necesitas
    return token


def safe_filename(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9_-]", "_", text)
    return text


def format_date_ddmmyyyy(date_str: str) -> str:
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").strftime("%d/%m/%Y")
    except ValueError:
        return date_str


def format_date_long_es(date_str: str) -> str:
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        meses = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ]

        # ✅ día con cero a la izquierda
        dia = f"{date_obj.day:02d}"

        return f"{dia} de {meses[date_obj.month - 1]} del {date_obj.year}"
    except ValueError:
        return date_str

def format_date_range_long_es(fecha_inicio: str, fecha_fin: str) -> tuple[str, str]:
    """
    Devuelve (fecha_inicio_formateada, fecha_fin_formateada)
    aplicando la regla:
    - Si ambos años son iguales → el año solo se muestra en la fecha final
    - Si son distintos → cada fecha muestra su año
    """
    try:
        inicio = datetime.strptime(fecha_inicio, "%Y-%m-%d")
        fin = datetime.strptime(fecha_fin, "%Y-%m-%d")

        meses = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ]

        dia_inicio = f"{inicio.day:02d}"
        dia_fin = f"{fin.day:02d}"

        if inicio.year == fin.year:
            fecha_inicio_str = f"{dia_inicio} de {meses[inicio.month - 1]}"
            fecha_fin_str = f"{dia_fin} de {meses[fin.month - 1]} del {fin.year}"
        else:
            fecha_inicio_str = f"{dia_inicio} de {meses[inicio.month - 1]} del {inicio.year}"
            fecha_fin_str = f"{dia_fin} de {meses[fin.month - 1]} del {fin.year}"

        return fecha_inicio_str, fecha_fin_str

    except ValueError:
        # fallback seguro
        return format_date_long_es(fecha_inicio), format_date_long_es(fecha_fin)


def format_two_digits_number(value: int) -> str:
    """
    Formatea números enteros a dos dígitos.
    Ej: 3 -> 03, 12 -> 12
    """
    try:
        return f"{int(value):02d}"
    except (ValueError, TypeError):
        return str(value)


def format_two_digits_float(value: float) -> str:
    """
    Formatea números decimales manteniendo decimales,
    pero con parte entera a dos dígitos.
    Ej: 3 -> 03
        3.5 -> 03.5
        12 -> 12
        12.25 -> 12.25
    """
    try:
        entero = int(value)
        decimal = value - entero

        if decimal == 0:
            return f"{entero:02d}"

        # Eliminar ceros innecesarios en decimales
        decimal_str = str(round(decimal, 2)).lstrip("0")
        return f"{entero:02d}{decimal_str}"
    except (ValueError, TypeError):
        return str(value)


def calcular_horas_por_modulo(total_horas: int, cantidad_modulos: int) -> str:
    """
    Calcula horas por módulo:
    total_horas / cantidad_modulos
    Devuelve string sin decimales si es entero, o con 2 decimales si no.
    """
    if cantidad_modulos <= 0:
        return "0"

    valor = total_horas / cantidad_modulos

    # Si es entero, no mostrar decimales
    if valor.is_integer():
        return str(int(valor))

    # Si no, mostrar hasta 2 decimales
    return f"{valor:.2f}"


def nombre_completo_capitalizado(nombres: str, apellidos: str) -> str:
    texto = f"{nombres} {apellidos}".strip().lower()
    return " ".join(p.capitalize() for p in texto.split())


def modelo_con_mayuscula_inicial(tipo_modelo: str) -> str:
    texto = tipo_modelo.strip().lower().split()
    if not texto:
        return ""
    texto[0] = texto[0].capitalize()
    return " ".join(texto)


def resolve_template_path(modelo_certificado: str, tipo_modelo: str) -> str:
    modelo_key = (modelo_certificado or "").upper().strip()
    tipo_key = (tipo_modelo or "").upper().strip()

    if modelo_key not in MODELO_FOLDER_MAP:
        raise HTTPException(
            status_code=400,
            detail=f"Modelo de certificado no soportado: {modelo_key}"
        )

    if tipo_key not in TEMPLATE_FILENAME_MAP:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de certificado no soportado: {tipo_key}"
        )

    folder = MODELO_FOLDER_MAP[modelo_key]
    filename = TEMPLATE_FILENAME_MAP[tipo_key]

    return os.path.join("app", "templates", folder, filename)

##agregué
def normalize_text_for_url(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9]", "", text)
    return text.lower()


def build_qr_url(nombres: str, apellidos: str, tema: str) -> str:
    primer_nombre = nombres.strip().split()[0]
    primer_apellido = apellidos.strip().split()[0]

    base = (
        normalize_text_for_url(primer_nombre)
        + normalize_text_for_url(primer_apellido)
        + normalize_text_for_url(tema)
    )

    return f"https://especializacionvirtual.com/certificados/{base}.pdf"


def generate_qr_image(url: str) -> BytesIO:
    qr = qrcode.QRCode(
        version=4,
        error_correction=qrcode.constants.ERROR_CORRECT_Q,
        box_size=10,
        border=1,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer
##fin agregué

def insert_qr_at_placeholder(prs: Presentation, qr_stream: BytesIO):
    QR_SIZE = Cm(2.78)

    for slide in prs.slides:
        for shape in slide.shapes:
            if not shape.has_text_frame:
                continue

            if "{{QR_CODE}}" not in shape.text_frame.text:
                continue

            left = shape.left
            top = shape.top

            shape.text_frame.clear()

            slide.shapes.add_picture(
                qr_stream,
                left=left,
                top=top,
                width=QR_SIZE,
                height=QR_SIZE,
            )

            return  # solo un QR




                    

##DISTRIBUIR HORAS POR MÓDULO
def distribuir_horas_por_modulo(total_horas: int, cantidad_modulos: int) -> List[int]:
    """
    Distribuye las horas de forma progresiva y variada,
    asegurando que la suma final sea EXACTA.
    """
    if cantidad_modulos <= 0:
        return []

    pesos = []
    incremento = 0.1
    for i in range(cantidad_modulos):
        peso = 1 + (i * incremento)
        pesos.append(peso)
    suma_pesos = sum(pesos)
    
    horas = [
        int((peso / suma_pesos) * total_horas)
        for peso in pesos
    ]

    # Ajuste para asegurar suma exacta
    diferencia = total_horas - sum(horas)

    # Repartir diferencia empezando por el último módulo
    i = cantidad_modulos - 1
    while diferencia > 0:
        horas[i] += 1
        diferencia -= 1
        i -= 1
        if i < 0:
            i = cantidad_modulos - 1

    return horas


# -------------------------------------------------
# REGISTRO DE EVENTOS DE USO (MICROSERVICE-EVENTS)
# -------------------------------------------------

def registrar_evento_uso(
    token: str,
    evento: str,
    items: int,
    origen: str = "API_FASTAPI"
):
    """
    Registra un evento de uso en microservice-events.

    - token: AccessToken JWT recibido desde frontend
    - evento: tipo de evento (PPTX_GENERATED, LOGIN, etc.)
    - items: cantidad de elementos procesados
    - origen: origen del evento (API_FASTAPI)
    """

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    payload = {
        "evento": evento,
        "items": items,
        "origen": origen
    }
    try:
        r = requests.post(
            EVENTS_SERVICE_URL,
            json=payload,
            headers=headers,
            timeout=2
        )
        # ✅ LOG ÚTIL (solo debug, luego lo puedes bajar)
        if r.status_code >= 400:
            print(f"[WARN] Tracking falló {r.status_code}: {r.text}")
    except Exception as e:
        print(f"[WARN] No se pudo registrar evento: {e}")

        

# -------------------------------------------------
# OPENAI – GENERACIÓN DE MÓDULOS DINÁMICA
# -------------------------------------------------

def build_prompt(tema: str, count: int) -> str:
    return f"""
Devuelve EXCLUSIVAMENTE un JSON válido con este formato exacto:

{{
  "modulos": [
    {', '.join(['"string"' for _ in range(count)])}
  ]
}}

REGLAS OBLIGATORIAS:
- Exactamente {count} módulos
- SOLO títulos (NO descripciones)
- Máximo 12 palabras por módulo
- En español
- NO numeración
- NO texto fuera del JSON
- NO explicaciones

Certificado: {tema}
""".strip()


def obtener_modulos_por_tema(tipo: str, tema: str) -> list[str]:
    cache_key = (tipo, tema)
    if cache_key in MODULOS_CACHE:
        return MODULOS_CACHE[cache_key]

    if tipo not in MODULOS_COUNT:
        raise ValueError("Tipo no soportado para módulos")

    count = MODULOS_COUNT[tipo]

    try:
        response = client.responses.create(
            model="gpt-5-mini",
            input=[
                {"role": "system", "content": "Eres un asistente académico extremadamente estricto."},
                {"role": "user", "content": build_prompt(tema, count)}
            ]
        )

        data = json.loads(response.output_text)
        modulos = data.get("modulos", [])

        if not isinstance(modulos, list) or len(modulos) != count:
            raise ValueError("Cantidad de módulos inválida")

        modulos = [str(m).upper().strip() for m in modulos]
        MODULOS_CACHE[cache_key] = modulos
        return modulos

    except Exception:
        return [f"MÓDULO {i+1}" for i in range(count)]


# -------------------------------------------------
# CORS
# -------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------
# DTO
# -------------------------------------------------

class DiplomaRequest(BaseModel):
    modeloCertificado: str
    tipoModelo: str
    nombres: str
    apellidos: str
    temaDiplomado: str
    fechaInicio: str
    fechaFin: str
    horasAcademicas: int
    creditosAcademicos: int
    folioNumero: str
    fechaEmision: str


class BatchRequest(BaseModel):
    items: List[DiplomaRequest]


# -------------------------------------------------
# REEMPLAZO DE TEXTO (PRESERVA FUENTES)
# -------------------------------------------------

def replace_in_text_frame_preserve_font(text_frame, mapping):
    for paragraph in text_frame.paragraphs:
        for run in paragraph.runs:
            if not run.text:
                continue
            for k, v in mapping.items():
                if k in run.text:
                    run.text = run.text.replace(k, v)


def replace_in_shape(shape, mapping):
    if shape.has_text_frame:
        replace_in_text_frame_preserve_font(shape.text_frame, mapping)

    if shape.has_table:
        for row in shape.table.rows:
            for cell in row.cells:
                replace_in_text_frame_preserve_font(cell.text_frame, mapping)

    if shape.shape_type == MSO_SHAPE_TYPE.GROUP:
        for s in shape.shapes:
            replace_in_shape(s, mapping)


def replace_placeholders(prs, mapping):
    for slide in prs.slides:
        for shape in slide.shapes:
            replace_in_shape(shape, mapping)

        if slide.has_notes_slide:
            for shape in slide.notes_slide.shapes:
                replace_in_shape(shape, mapping)

    for layout in prs.slide_layouts:
        for shape in layout.shapes:
            replace_in_shape(shape, mapping)

    for master in prs.slide_masters:
        for shape in master.shapes:
            replace_in_shape(shape, mapping)


# -------------------------------------------------
# MERGE PPTX
# -------------------------------------------------

def _replace_rids_in_element(el, rid_map: dict[str, str]):
    for e in el.iter():
        if not hasattr(e, "attrib"):
            continue
        for attr_key, attr_val in list(e.attrib.items()):
            if attr_val in rid_map:
                e.attrib[attr_key] = rid_map[attr_val]


def clone_slide_into(dest_prs: Presentation, src_slide):
    # ✅ USAR LAYOUT EN BLANCO (evita placeholders duplicados)
    blank_layout = dest_prs.slide_layouts[6]
    new_slide = dest_prs.slides.add_slide(blank_layout)

    spTree = new_slide.shapes._spTree
    src_spTree = src_slide.shapes._spTree

    for child in list(src_spTree):
        tag = child.tag.lower()

        # ❌ NO copiar propiedades internas del layout
        if tag.endswith("nvgrpsppr") or tag.endswith("grpsppr"):
            continue

        spTree.insert_element_before(deepcopy(child), 'p:extLst')

    # 🔁 Copiar relaciones (imágenes, fondos, etc.)
    rid_map = {}
    for rId, rel in src_slide.part.rels.items():
        try:
            new_rId = new_slide.part.relate_to(
                rel._target,
                rel.reltype,
                is_external=rel.is_external
            )
            rid_map[rId] = new_rId
        except Exception:
            continue

    _replace_rids_in_element(new_slide._element, rid_map)


def merge_presentations(presentations: List[Presentation]) -> Presentation:
    if not presentations:
        raise ValueError("No hay presentaciones para unir")

    # 🔒 Usar la primera presentación como base (PRESERVA TEMA Y COLORES)
    dest = presentations[0]

    for prs in presentations[1:]:
        for slide in prs.slides:
            clone_slide_into(dest, slide)

    return dest


# -------------------------------------------------
# GENERACIÓN DE PPTX POR ITEM  ✅ RESTAURADA
# -------------------------------------------------

def generar_presentacion_por_item(item: DiplomaRequest) -> Presentation:
    tipo = item.tipoModelo.upper().strip()
    modelo_cert = item.modeloCertificado.upper().strip()

    template_path = resolve_template_path(modelo_cert, tipo)

    if not os.path.exists(template_path):
        raise HTTPException(
            status_code=500,
            detail=f"No existe la plantilla: {template_path}"
        )

    prs = Presentation(template_path)
    
    # Determinar formato de fecha según modelo de certificado
    usar_fecha_larga = modelo_cert in MODELOS_FECHA_LARGA

    if usar_fecha_larga:
        fecha_inicio, fecha_fin = format_date_range_long_es(
            item.fechaInicio,
            item.fechaFin
        )
        fecha_emision_larga = format_date_long_es(item.fechaEmision)
        fecha_emision_corta = format_date_ddmmyyyy(item.fechaEmision)
        # fecha_emision = format_date_long_es(item.fechaEmision)
    else:
        fecha_inicio = format_date_ddmmyyyy(item.fechaInicio)
        fecha_fin = format_date_ddmmyyyy(item.fechaFin)
        fecha_emision_larga = format_date_long_es(item.fechaEmision)
        fecha_emision_corta = format_date_ddmmyyyy(item.fechaEmision)
        # fecha_emision = format_date_ddmmyyyy(item.fechaEmision)
    
    nombre_posterior = nombre_completo_capitalizado(item.nombres, item.apellidos)
    modulos = obtener_modulos_por_tema(tipo, item.temaDiplomado)
    
    ##horas de módulos correctamente distribuidas
    cantidad_modulos = MODULOS_COUNT[tipo]

    horas_por_modulo_global = calcular_horas_por_modulo(
        item.horasAcademicas,
        cantidad_modulos
    )
    
    horas_por_modulo = distribuir_horas_por_modulo(
        item.horasAcademicas,
        cantidad_modulos
    )

    mapping = {
        "{{MODELO}}": tipo,
        "{{MODELO_MINUSCULA}}": modelo_con_mayuscula_inicial(tipo),

        "{{NOMBRES}}": item.nombres.upper(),
        "{{APELLIDOS}}": item.apellidos.upper(),
        "{{TEMA_DIPLOMADO}}": item.temaDiplomado.upper(),

        "{{NOMBRE_COMPLETO_MINUSCULA}}": nombre_posterior,

        "{{FECHA_INICIO}}": fecha_inicio,
        "{{FECHA_FIN}}": fecha_fin,

        "{{HORAS_ACADEMICAS}}": format_two_digits_number(item.horasAcademicas),
        "{{CREDITOS_ACADEMICOS}}": format_two_digits_float(item.creditosAcademicos),
        
        "{{HORAS_MODULO}}": horas_por_modulo_global,

        "{{FOLIO_NUMERO}}": item.folioNumero,

        "{{FECHA_EMISION_LARGA}}": fecha_emision_larga,
        "{{FECHA_EMISION_CORTA}}": fecha_emision_corta,
    }

    for i, m in enumerate(modulos, start=1):
        mapping[f"{{{{MODULO_{i}}}}}"] = m
    
    ##Agregar horas por módulo al mapping       
    for i, h in enumerate(horas_por_modulo, start=1):
        mapping[f"{{{{HORAS_MODULO_{i}}}}}"] = str(h)


    replace_placeholders(prs, mapping)
    
    return prs


# -------------------------------------------------
# ENDPOINTS
# -------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok"}

# -------------------------------------------------
# REGISTRO DE EVENTO DE USO (NO CRÍTICO)
# -------------------------------------------------

"""
authorization:
- Header Authorization enviado por Angular
- Contiene Bearer <accessToken>
- Se reutiliza para autenticar contra microservice-events
"""
@app.post("/api/diplomas")
def generate_pptx_batch(
    payload: BatchRequest,
    access_token: str = Depends(validate_access_token),
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="items no puede estar vacío")

    # ✅ Registrar apenas llega (token ya validado y fresco)
    registrar_evento_uso(
        token=access_token,
        evento="PPTX_GENERATION_REQUEST",
        items=len(payload.items),
        origen="API_FASTAPI"
    )

    # 1. Generar presentaciones SIN QR
    presentations: List[Presentation] = []
    for item in payload.items:
        prs = generar_presentacion_por_item(item)
        presentations.append(prs)

    # 2. Merge
    merged = merge_presentations(presentations)

    # 3. Insertar QR DESPUÉS del merge (clave)
    for slide, item in zip(merged.slides, payload.items):
        qr_url = build_qr_url(
            item.nombres,
            item.apellidos,
            item.temaDiplomado
        )
        qr_image = generate_qr_image(qr_url)
        insert_qr_at_placeholder(merged, qr_image)

    # 4. Exportar
    output = BytesIO()
    merged.save(output)
    output.seek(0)

    filename = f"CERTIFICADOS_{int(datetime.now().timestamp())}.pptx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
