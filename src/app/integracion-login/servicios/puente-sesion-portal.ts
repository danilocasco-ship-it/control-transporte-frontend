import { Injectable } from '@angular/core';
import { ServicioSesion } from './servicio-sesion';

@Injectable({ providedIn: 'root' })
export class PuenteSesionPortal {
  constructor(private sesion: ServicioSesion) {}

  aplicarToken(token: string): void {
    this.sesion.aplicarToken(token);
  }

  limpiar(): void {
    this.sesion.limpiar();
  }

  tieneToken(): boolean {
    return !!this.sesion.token;
  }
}
