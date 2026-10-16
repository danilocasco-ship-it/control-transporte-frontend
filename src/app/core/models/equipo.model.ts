export interface Equipo {
  codempresa: number;
  codequipo: number;
  nomequipo: string;
  codtipomaquinaria: number | null;
  codmarca: number | null;
  codproveedor: number | null;
  nomproveedor?: string | null;
  modelo: string | null;
  anio: number | null;
  placa: string | null;
  capacidad: string | null;
  estado: number;
  fecharegistro?: string | null;
  codusuario?: string | null;
}
