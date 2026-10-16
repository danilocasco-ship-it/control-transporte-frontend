export class LoginRequestDTO {
  codusuario: string;
  clave: string;
  codempresa: number;

  constructor(data: Partial<LoginRequestDTO>) {
    if (!data.codusuario || data.codusuario.trim() === '') {
      throw new Error('El campo "usuario" es obligatorio.');
    }
    if (!data.clave || data.clave.trim() === '') {
      throw new Error('El campo "clave" es obligatorio.');
    }

    this.codusuario = data.codusuario;
    this.clave = data.clave;
    this.codempresa = data.codempresa ?? 9;
  }
}
