export interface TipoMaquinaria {
  codempresa: number;
  codtipomaquinaria: number;
  nomtipomaquinaria: string;
  codtipomaquinariapadre: number | null;
}

export interface Marca {
  codempresa: number;
  codmarca: number;
  nommarca: string;
  descripcion: string | null;
}

export interface Sucursal { codempresa: number; codsucursal: number; nomsucursal: string; }
export interface Contratista { codempresa: number; codempleado: string; nomempleado: string; codestado: number; }
export interface EstadoEquipo { codempresa: number; codestado: number; nomestado: string; }
