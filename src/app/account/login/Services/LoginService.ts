import { Injectable } from '@angular/core';
import { ApiConnectionService } from '../../../core/services/api-connection.service';
import { ServicioSesion } from 'src/app/integracion-login/servicios/servicio-sesion';
import { LoginRequestDTO } from '../DTO/LoginRequestDTO';
import { LoginResponseDTO } from '../DTO/LoginResponseDTO';

@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor(
    private apiConnectionService: ApiConnectionService,
    private sesion: ServicioSesion
  ) {}

  async login(credentials: LoginRequestDTO): Promise<LoginResponseDTO> {
    const url = 'api/Login/Login';
    return this.apiConnectionService.sendRequestAsync<LoginResponseDTO>(
      url,
      'POST',
      credentials
    );
  }

  saveToken(token: string): void {
    this.sesion.aplicarToken(token);
  }

  logout(): void {
    this.sesion.limpiar();
  }

  get token(): string | null {
    return this.sesion.token;
  }
}
