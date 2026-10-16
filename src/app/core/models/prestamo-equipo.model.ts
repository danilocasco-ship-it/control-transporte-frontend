export interface PrestamoEquipo {
  codempresa: number;
  codsucursal: number;
  codcontratista: number;
  codequipo: number;
  fecharegistro?: string | null;
  fechaprestamo: string | null;
  estadoprestamo: string | null;
  fechadevolucion: string | null;
  estadodevolucion: string | null;
  observaciones: string | null;
  codusuario?: string | null;
}
