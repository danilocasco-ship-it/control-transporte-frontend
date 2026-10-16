import { Injectable } from '@angular/core';
import { ApiConnectionService } from './api-connection.service';
import { Equipo } from '../models/equipo.model';

@Injectable({ providedIn: 'root' })
export class EquipoService {
  private readonly endpoint = 'api/Equipos';

  constructor(private apiConnection: ApiConnectionService) {}

  crear(equipo: Equipo): Promise<Equipo> {
    return this.apiConnection.sendRequestAsync<Equipo>(this.endpoint, 'POST', equipo);
  }

  obtenerTodos(): Promise<Equipo[]> {
    return this.apiConnection.sendRequestAsync<Equipo[]>(this.endpoint, 'GET');
  }

  obtenerPorId(codempresa: number, codequipo: number): Promise<Equipo> {
    return this.apiConnection.sendRequestAsync<Equipo>(`${this.endpoint}/${codempresa}/${codequipo}`, 'GET');
  }

  actualizar(codempresa: number, codequipo: number, equipo: Equipo): Promise<Equipo> {
    return this.apiConnection.sendRequestAsync<Equipo>(`${this.endpoint}/${codempresa}/${codequipo}`, 'PUT', equipo);
  }

  eliminar(codempresa: number, codequipo: number): Promise<void> {
    return this.apiConnection.sendRequestAsync<void>(`${this.endpoint}/${codempresa}/${codequipo}`, 'DELETE');
  }
}
