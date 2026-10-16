import { Injectable } from '@angular/core';
import { ApiConnectionService } from './api-connection.service';
import { Contratista, EstadoEquipo, Marca, Sucursal, TipoMaquinaria } from '../models/catalogo-equipo.model';

@Injectable({ providedIn: 'root' })
export class CatalogoEquipoService {
  constructor(private apiConnection: ApiConnectionService) {}

  obtenerTiposMaquinaria(codempresa: number): Promise<TipoMaquinaria[]> {
    return this.apiConnection.sendRequestAsync<TipoMaquinaria[]>(`api/catalogos/tipos-maquinaria/${codempresa}`, 'GET');
  }

  obtenerMarcas(codempresa: number): Promise<Marca[]> {
    return this.apiConnection.sendRequestAsync<Marca[]>(`api/catalogos/marcas/${codempresa}`, 'GET');
  }

  obtenerSucursales(codempresa: number): Promise<Sucursal[]> { return this.apiConnection.sendRequestAsync<Sucursal[]>(`api/catalogos/sucursales/${codempresa}`, 'GET'); }
  obtenerContratistas(codempresa: number): Promise<Contratista[]> { return this.apiConnection.sendRequestAsync<Contratista[]>(`api/catalogos/contratistas/${codempresa}`, 'GET'); }
  obtenerEstados(codempresa: number): Promise<EstadoEquipo[]> { return this.apiConnection.sendRequestAsync<EstadoEquipo[]>(`api/catalogos/estados/${codempresa}`, 'GET'); }
}
