// src/app/core/services/proveedor.service.ts

import { Injectable } from '@angular/core';
import { ApiConnectionService } from './api-connection.service'; // Usamos el mensajero que YA funciona
import { Proveedor } from '../models/proveedor.model';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  // Inyectamos el servicio de conexión que tu proyecto ya usa
  constructor(private apiConnection: ApiConnectionService) {}

  // Método para agregar un nuevo proveedor
  async agregarProveedor(nuevoProveedor: Proveedor): Promise<any> {
    const url = 'api/Proveedores'; // Esta ruta se unirá automáticamente a la URL base que ya funciona
    
    try {
      const respuesta = await this.apiConnection.sendRequestAsync<any>(
        url,
        'POST',
        nuevoProveedor
      );
      return respuesta;

    } catch (error) {
      console.error('Error al guardar el proveedor:', error);
      throw error;
    }
  }
// Obtener todos los proveedores
async obtenerTodos(): Promise<any> {
  const url = 'api/Proveedores';
  
  try {
    const respuesta = await this.apiConnection.sendRequestAsync<any>(
      url,
      'GET',
      null
    );
    return respuesta;
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    throw error;
  }
}

// Eliminar proveedor
async eliminar(codempresa: number, codproveedor: number): Promise<any> {
  const url = `api/Proveedores/${codempresa}/${codproveedor}`;
  
  try {
    const respuesta = await this.apiConnection.sendRequestAsync<any>(
      url,
      'DELETE',
      null
    );
    return respuesta;
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    throw error;
  }
}

  // Actualizar proveedor DANILO 18/09/2026
  async actualizar(codempresa: number, codproveedor: number, proveedor: Proveedor): Promise<any> {
    const url = `api/Proveedores/${codempresa}/${codproveedor}`;
    
    try {
      const respuesta = await this.apiConnection.sendRequestAsync<any>(
        url,
        'PUT',
        proveedor
      );
      return respuesta;
    } catch (error) {
      console.error('Error al actualizar el proveedor:', error);
      throw error;
    }
  }

  // Obtener un solo proveedor por ID
  async obtenerPorId(codempresa: number, codproveedor: number): Promise<any> {
    const url = `api/Proveedores/${codempresa}/${codproveedor}`;
    
    try {
      const respuesta = await this.apiConnection.sendRequestAsync<any>(
        url,
        'GET',
        null
      );
      return respuesta;
    } catch (error) {
      console.error('Error al obtener proveedor:', error);
      throw error;
    }
  }



}