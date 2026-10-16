import { Injectable } from "@angular/core";
import { FileDownloadService } from "./file-download.service";
import { AlertcustomService } from "./alertcustom.service";
import { BehaviorSubject } from "rxjs";
import { ServicioSesion } from "../../integracion-login/servicios/servicio-sesion";

@Injectable({
  providedIn: "root",
})
export class DataService {
  constructor(
    private sesion: ServicioSesion,
    private alertService: AlertcustomService,
    private fileDownloadService: FileDownloadService
  ) {}

  private get token(): string {
    return this.sesion.token || "";
  }

  private get username(): string {
    return this.sesion.username || "";
  }

  async obtenerDatos<T>(
    servicio: any,
    metodo: string,
    behaviorSubject: BehaviorSubject<T[]>,
    mensajeError: string,
    id?: any
  ): Promise<void> {
    try {
      const data =
        id !== undefined
          ? await servicio[metodo](id, this.token, this.username)
          : await servicio[metodo](this.token, this.username);
      behaviorSubject.next(data);
    } catch (error) {
      console.error(`${mensajeError}:`, error);
      this.alertService.showError(mensajeError);
    }
  }

  async descargarArchivo(
    servicio: any,
    metodo: string,
    tipoArchivo: "XML" | "Excel" | "PDF" | "Texto",
    mensajeError: string,
    archivo?: any,
    datos?: any
  ): Promise<void> {
    try {
      const response = await servicio[metodo](
        this.token,
        this.username,
        archivo,
        datos
      );
      if (tipoArchivo === "XML") {
        this.fileDownloadService.downloadXmlFile(
          response.data,
          response.fileName
        );
      } else if (tipoArchivo === "Excel") {
        this.fileDownloadService.downloadExcelFile(
          response.data,
          response.fileName
        );
      } else if (tipoArchivo === "PDF") {
        this.fileDownloadService.downloadPdfFile(
          response.data,
          response.fileName
        );
      } else if (tipoArchivo === "Texto") {
        this.fileDownloadService.downloadTextFile(
          response.data,
          response.fileName
        );
      }
    } catch (error) {
      console.error(`${mensajeError}:`, error);
      this.alertService.showError(mensajeError);
    }
  }

  async agregarRegistro<T>(
    servicio: any,
    metodo: string,
    datos: any,
    mensajeExito: string,
    mensajeError: string
  ): Promise<void> {
    try {
      await servicio[metodo](datos, this.token, this.username);
      this.alertService.showSuccess(mensajeExito);
    } catch (error) {
      console.error(`${mensajeError}:`, error);
      this.alertService.showError(mensajeError);
    }
  }

  async actualizarRegistro<T>(
    servicio: any,
    metodo: string,
    datos: any,
    mensajeExito: string,
    mensajeError: string,
    headers: string = ""
  ): Promise<void> {
    try {
      await servicio[metodo](datos, this.token, this.username);
      this.alertService.showSuccess(mensajeExito);
    } catch (error) {
      this.alertService.showError(`${String(error)}`);
    }
  }

  async eliminarRegistro(
    servicio: any,
    metodo: string,
    id: number | string | Record<string, any>,
    mensajeExito: string,
    mensajeError: string
  ): Promise<void> {
    try {
      await servicio[metodo](id, this.token, this.username);
      this.alertService.showSuccess(mensajeExito);
    } catch (error) {
      console.error(`${mensajeError}:`, error);
      this.alertService.showError(mensajeError);
    }
  }
}
