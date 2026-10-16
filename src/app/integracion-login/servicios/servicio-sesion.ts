import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { JwtHelperService } from '@auth0/angular-jwt';

export interface DatosSesionToken {
  usuario: string;
  nomusuario: string;
  expiracion: Date;
}

/**
 * Sesión del módulo: guarda/lee el JWT nativo
 * (login local o handoff SSO).
 */
@Injectable({ providedIn: 'root' })
export class ServicioSesion {
  private readonly jwtHelper = new JwtHelperService();

  private get storage(): Storage {
    return sessionStorage;
  }

  get token(): string | null {
    return this.storage.getItem('authToken');
  }

  get username(): string | null {
    return this.storage.getItem('username');
  }

  aplicarToken(token: string): void {
    const cleanToken = token.replace(/^Bearer\s+/i, '');
    this.storage.setItem('authToken', cleanToken);

    const user = this.decodificar(cleanToken);
    if (user) {
      this.storage.setItem('profile', user.nomusuario || '');
      this.storage.setItem('username', user.usuario);
    }
  }

  limpiar(): void {
    ['authToken', 'profile', 'permission', 'username', 'id', 'botones'].forEach(
      (key) => this.storage.removeItem(key)
    );
  }

  tokenExpirado(): boolean {
    if (!this.token) return false;
    return this.jwtHelper.isTokenExpired(this.token);
  }

  private decodificar(token: string): DatosSesionToken | null {
    try {
      const decoded: any = jwtDecode(token);
      return {
        usuario: decoded.codusuario,
        nomusuario: decoded.nomusuario,
        expiracion: new Date(decoded.exp * 1000),
      };
    } catch {
      return null;
    }
  }
}
