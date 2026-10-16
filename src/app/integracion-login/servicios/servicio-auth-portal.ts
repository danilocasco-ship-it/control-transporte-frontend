import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { configPortalAuth, rutasHandoff } from '../config/portal-auth.config';
import { RespuestaCanje, RespuestaSesion } from '../modelos/modelos-auth-portal';
import { PuenteSesionPortal } from './puente-sesion-portal';

@Injectable({ providedIn: 'root' })
export class ServicioAuthPortal {
  private readonly config = configPortalAuth;

  constructor(
    private puenteSesion: PuenteSesionPortal,
    private router: Router
  ) {}

  estaActivo(): boolean {
    return this.config.activo === true;
  }

  async inicializar(): Promise<void> {
    if (!this.estaActivo()) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const uuid = params.get('uuid');

    if (!code || !uuid) {
      return;
    }

    try {
      await this.canjearCodigo(code);
    } catch {
      // El code es de un solo uso; la sesion ya se creo en /validar.
    }

    try {
      const sesion = await this.obtenerSesion(uuid);
      this.puenteSesion.aplicarToken(sesion.token);
      await this.router.navigateByUrl('/');
    } catch (error) {
      console.error('[loginM] handoff sesion fallo', error);
    } finally {
      this.limpiarQuery();
    }
  }

  /** Portal si activo; login local del modulo si no. */
  irAlLogin(): void {
    if (this.estaActivo()) {
      window.location.href = this.config.urlAppLogin;
      return;
    }
    void this.router.navigate(['/auth/login']);
  }

  cerrarSesion(): void {
    this.puenteSesion.limpiar();
    this.irAlLogin();
  }

  private async canjearCodigo(code: string): Promise<RespuestaCanje> {
    const url = `${this.normalizar(this.config.urlApiLogin)}/${rutasHandoff.canjeCodigo}`;
    return this.postJson<RespuestaCanje>(url, { code });
  }

  private async obtenerSesion(uuid: string): Promise<RespuestaSesion> {
    const url = `${this.normalizar(this.config.urlApiModulo)}/${rutasHandoff.sesion}`;
    return this.postJson<RespuestaSesion>(url, { uuid });
  }

  private async postJson<T>(url: string, body: unknown): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Handoff fallo: ${response.status}`);
    }

    return (await response.json()) as T;
  }

  private normalizar(url: string): string {
    return url.replace(/\/$/, '');
  }

  private limpiarQuery(): void {
    const limpia = `${window.location.origin}${window.location.pathname}${window.location.hash}`;
    window.history.replaceState({}, document.title, limpia);
  }
}
