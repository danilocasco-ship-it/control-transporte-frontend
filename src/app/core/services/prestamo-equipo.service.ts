import { Injectable } from '@angular/core';
import { ApiConnectionService } from './api-connection.service';
import { PrestamoEquipo } from '../models/prestamo-equipo.model';

@Injectable({ providedIn: 'root' })
export class PrestamoEquipoService {
  private readonly endpoint = 'api/PrestamoEquipo';
  constructor(private apiConnection: ApiConnectionService) {}

  crear(prestamo: PrestamoEquipo): Promise<PrestamoEquipo> {
    return this.apiConnection.sendRequestAsync<PrestamoEquipo>(this.endpoint, 'POST', prestamo);
  }

  obtenerTodos(codempresa: number): Promise<PrestamoEquipo[]> {
    return this.apiConnection.sendRequestAsync<PrestamoEquipo[]>(`${this.endpoint}/empresa/${codempresa}`, 'GET');
  }

  obtenerPorId(codempresa: number, codsucursal: number, codcontratista: number, codequipo: number): Promise<PrestamoEquipo> {
    return this.apiConnection.sendRequestAsync<PrestamoEquipo>(`${this.endpoint}/${codempresa}/${codsucursal}/${codcontratista}/${codequipo}`, 'GET');
  }

  actualizar(codempresa: number, codsucursal: number, codcontratista: number, codequipo: number, prestamo: PrestamoEquipo): Promise<PrestamoEquipo> {
    return this.apiConnection.sendRequestAsync<PrestamoEquipo>(`${this.endpoint}/${codempresa}/${codsucursal}/${codcontratista}/${codequipo}`, 'PUT', prestamo);
  }

  eliminar(codempresa: number, codsucursal: number, codcontratista: number, codequipo: number): Promise<void> {
    return this.apiConnection.sendRequestAsync<void>(`${this.endpoint}/${codempresa}/${codsucursal}/${codcontratista}/${codequipo}`, 'DELETE');
  }
}
