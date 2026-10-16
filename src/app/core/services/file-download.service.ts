import { Injectable } from "@angular/core"; // Asumiendo que tienes un servicio de alertas
import { AlertcustomService } from "./alertcustom.service";

@Injectable({
  providedIn: "root",
})
export class FileDownloadService {
  constructor(private alertService: AlertcustomService) {}

  /**
   * Descarga un archivo XML con el contenido especificado en "data" y lo guarda
   * en el disco duro con el nombre especificado en "fileName". Si no se especifica
   * un nombre de archivo, se llama "download.xml".
   * Emite un mensaje de error si ocurre un error al descargar el archivo.
   * @param data Contenido del archivo XML a descargar.
   * @param fileName Nombre del archivo a descargar. Opcional.
   */
  downloadXmlFile(data: any, fileName: string): void {
    let url: string | null = null;
    try {
      // Crear un blob con el contenido del archivo XML
      const blob = new Blob([data], { type: "application/xml" });
      url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "download.xml";
      a.click();
      this.alertService.showSuccess("XML descargado con éxito");
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
      this.alertService.showError("Error al descargar el archivo");
    } finally {
      // Liberar recursos
      if (url) {
        window.URL.revokeObjectURL(url);
      }
    }
  }

  /**
   * Descarga un archivo Excel con el contenido especificado en "data" y lo guarda
   * en el disco duro con el nombre especificado en "fileName". Si no se especifica
   * un nombre de archivo, se llama "download.xlsx".
   * Emite un mensaje de error si ocurre un error al descargar el archivo.
   * @param data Contenido del archivo Excel a descargar.
   * @param fileName Nombre del archivo a descargar. Opcional.
   */

  downloadExcelFile(data: any, fileName: string): void {
    let url: string | null = null;
    try {
      // Crear un blob con el contenido del archivo Excel
      const blob = new Blob([data], { type: "application/vnd.ms-excel" });
      url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "Presupuesto vs Consumo.xlsx";
      a.click();
      this.alertService.showSuccess("Excel descargado con éxito");
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
      this.alertService.showError("Error al descargar el archivo");
    } finally {
      // Liberar recursos
      if (url) {
        window.URL.revokeObjectURL(url);
      }
    }
  }




  /**
   * Descarga un archivo PDF con el contenido especificado en "data" y lo guarda
   * en el disco duro con el nombre especificado en "fileName". Si no se especifica
   * un nombre de archivo, se llama "download.pdf".
   * Emite un mensaje de error si ocurre un error al descargar el archivo.
   * @param data Contenido del archivo PDF a descargar.
   * @param fileName Nombre del archivo a descargar. Opcional.
   */
  downloadPdfFile(data: any, fileName: string): void {
    let url: string | null = null;
    try {
      // Crear un blob con el contenido del archivo PDF
      const blob = new Blob([data], { type: "application/pdf" });
      url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "download.pdf";
      a.click();
      this.alertService.showSuccess("PDF descargado con éxito");
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
      this.alertService.showError("Error al descargar el archivo");
    } finally {
      // Liberar recursos
      if (url) {
        window.URL.revokeObjectURL(url);
      }
    }
  }

  /**
   * Descarga un archivo de texto con el contenido especificado en "data" y lo guarda
   * en el disco duro con el nombre especificado en "fileName". Si no se especifica
   * un nombre de archivo, se llama "download.txt".
   * Emite un mensaje de error si ocurre un error al descargar el archivo.
   * @param data Contenido del archivo de texto a descargar.
   * @param fileName Nombre del archivo a descargar. Opcional.
   */
  downloadTextFile(data: any, fileName: string): void {
    let url: string | null = null;
    try {
      // Crear un blob con el contenido del archivo de texto
      const blob = new Blob([data], { type: "text/plain" });
      url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "download.txt";
      a.click();
      this.alertService.showSuccess("Texto descargado con éxito");
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
      this.alertService.showError("Error al descargar el archivo");
    } finally {
      // Liberar recursos
      if (url) {
        window.URL.revokeObjectURL(url);
      }
    }
  }
}
