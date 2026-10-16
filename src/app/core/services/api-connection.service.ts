import { Injectable } from "@angular/core";
import { GlobalComponent } from "src/app/global-component";
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
  HttpRequest,
} from "@angular/common/http";
import { catchError, Observable, throwError } from "rxjs";
import { plainToClass } from "class-transformer";
import { ServicioSesion } from "src/app/integracion-login/servicios/servicio-sesion";

@Injectable({
  providedIn: "root",
})
export class ApiConnectionService {
  constructor(
    private http: HttpClient,
    private sesion: ServicioSesion
  ) {}

  /**
   * Añade el token de sesión a las cabeceras.
   *
   * Hay que hacerlo aquí y no con un interceptor: estas peticiones usan el
   * `fetch` nativo, así que los HttpInterceptor de Angular (JwtInterceptor)
   * NO se aplican a ellas. El token se guarda ya sin el prefijo "Bearer ", por
   * eso se vuelve a añadir aquí.
   */
  private conTokenDeSesion(
    headers: Record<string, string>
  ): Record<string, string> {
    const token = this.sesion.token;
    return token
      ? { ...headers, Authorization: `Bearer ${token}` }
      : { ...headers };
  }

  /**
   * El token ya no sirve (caducado o inválido): se limpia la sesión y se
   * devuelve al login, en lugar de dejar al usuario en una pantalla que no
   * carga y sin explicación.
   */
  private manejarNoAutorizado(): void {
    this.sesion.limpiar();
    if (!window.location.pathname.startsWith("/auth/login")) {
      window.location.assign("/auth/login");
    }
  }

  /**
   * Envia una solicitud HTTP a la API y devuelve la respuesta
   * como un objeto de tipo T. Si la respuesta no es exitosa, lanza
   * un error con el mensaje de error correspondiente.
   * @param apiUrl Endpoint de la API
   * @param method Verbo HTTP a utilizar
   * @param body Cuerpo de la solicitud (opcional)
   * @param headers Encabezados de la solicitud (opcional)
   * @param parameters Par metros de la solicitud (opcional)
   * @returns La respuesta de la API como un objeto de tipo T
   */
  async sendRequestAsync<T>(
    apiUrl: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body: any = null,
    headers: Record<string, string> = {},
    parameters: Record<string, string> = {},
    classType?: new (...args: any[]) => T extends (infer U)[] ? U : T
  ): Promise<T> {
    apiUrl = GlobalComponent.AUTH_API + apiUrl;

    if (Object.keys(parameters).length > 0) {
      const queryString = new URLSearchParams(parameters).toString();
      apiUrl += `?${queryString}`;
    }

    const requestOptions: RequestInit = {
      method: method,
      headers: this.conTokenDeSesion(headers),
    };

    if (body !== null) {
      requestOptions.body = JSON.stringify(body);
      (requestOptions.headers as Record<string, string>)["Content-Type"] =
        "application/json";
    }

    try {
      const response = await fetch(apiUrl, requestOptions);
      // const responseData = await response.json(); // Usa json() en lugar de text() para evitar doble parseo

      // Evaluar si responseData lleva datos
      if (!response.ok) {
        if (response.status === 401) this.manejarNoAutorizado();

        // Un 401 de JwtBearer llega SIN cuerpo. Sin este catch, response.json()
        // lanzaría un error de parseo y taparía el motivo real.
        const errorData = await response.json().catch(() => ({}) as any);

        throw new Error(errorData.respuesta || response.statusText);
      }

      const responseData = await response.json();

      // Si classType es Array (por defecto), retorna los datos sin mapeo
      if (!classType) {
        // return (await response.json()) as T;
        return responseData as T;
      }

      // Si es un array, mapear cada elemento
      if (Array.isArray(responseData)) {
        return responseData.map((item: any) =>
          plainToClass(classType, item)
        ) as T;
      }

      // Si se pasó una clase específica, aplica plainToClass
      return plainToClass(classType, responseData) as T;
      // return (await response.json()) as T;
    } catch (error: unknown) {
      console.error("Error sending request:", error);
      throw error; // Considera definir un error específico para manejar mejor los errores
    }
  }

  //mejoras
  async sendFileRequestAsync<T>(
    apiUrl: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    fileTypeConfig: {
      defaultFileName: string;
      responseType: "text" | "blob" | "json";
    },
    body: any = null,
    headers: Record<string, string> = {},
    parameters: Record<string, string> = {}
  ): Promise<{ fileName: string; data: T }> {
    apiUrl = GlobalComponent.AUTH_API + apiUrl;

    // Manejo de parámetros URL
    if (Object.keys(parameters).length > 0) {
      apiUrl += `?${new URLSearchParams(parameters).toString()}`;
    }

    // Configuración de la solicitud
    const requestOptions: RequestInit = {
      method,
      headers: {
        ...this.conTokenDeSesion(headers),
        "Access-Control-Expose-Headers": "content-disposition",
      },
    };

    // Manejo del cuerpo de la solicitud
    if (body !== null) {
      requestOptions.body = JSON.stringify(body);
      if (!headers["Content-Type"]) {
        (requestOptions.headers as Record<string, string>)["Content-Type"] =
          "application/json";
      }
    }

    try {
      const response = await fetch(apiUrl, requestOptions);

      if (!response.ok) {
        if (response.status === 401) this.manejarNoAutorizado();
        throw new Error(`HTTP Error: ${response.status}`);
      }

      // Obtener nombre del archivo
      const fileName = this.getFileNameFromHeaders(
        response.headers,
        fileTypeConfig.defaultFileName
      );

      // Obtener datos según el tipo requerido
      let data;
      switch (fileTypeConfig.responseType) {
        case "blob":
          data = await response.blob();
          break;
        case "json":
          data = await response.json();
          break;
        default:
          data = await response.text();
      }

      return { fileName, data: data as T };
    } catch (error) {
      console.error("Error en la solicitud:", error);
      throw error;
    }
  }

  // Función helper para extraer el nombre del archivo
  private getFileNameFromHeaders(
    headers: Headers,
    defaultName: string
  ): string {
    const contentDisposition = headers.get("content-disposition");
    let fileName = defaultName;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename=(.*?)(;|$)/);
      const filenameStarMatch = contentDisposition.match(
        /filename\*=UTF-8''(.*?)(;|$)/
      );

      fileName = filenameStarMatch?.[1]
        ? decodeURIComponent(filenameStarMatch[1])
        : filenameMatch?.[1]?.replace(/["']/g, "") || fileName;
    }

    return fileName;
  }

  // Para XML
  async sendRequestXMLAsync<T>(
    apiUrl: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body: any = null,
    headers: Record<string, string> = {},
    parameters: Record<string, string> = {}
  ) {
    return this.sendFileRequestAsync<T>(
      apiUrl,
      method,
      {
        defaultFileName: "archivo.xml",
        responseType: "text",
      },
      body,
      headers,
      parameters
    );
  }

  // Para Excel
  async sendRequestExcelAsync<T>(
    apiUrl: string,
    method: "GET" | "POST",
    body: any = null,
    headers: Record<string, string> = {},
    parameters: Record<string, string> = {}
  ) {
    return this.sendFileRequestAsync<Blob>(
      apiUrl,
      method,
      {
        defaultFileName: "archivo.xlsx",
        responseType: "blob",
      },
      body,
      headers,
      parameters
    );
  }

  // Para PDF
  async sendRequestPDFAsync<T>(
    apiUrl: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body: any = null,
    headers: Record<string, string> = {},
    parameters: Record<string, string> = {}
  ) {
    return this.sendFileRequestAsync<Blob>(
      apiUrl,
      method,
      {
        defaultFileName: "archivo.pdf",
        responseType: "blob",
      },
      body,
      headers,
      parameters
    );
  }

  // Para texto plano
  async sendRequestTextAsync<T>(
    apiUrl: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body: any = null,
    headers: Record<string, string> = {},
    parameters: Record<string, string> = {}
  ) {
    return this.sendFileRequestAsync<string>(
      apiUrl,
      method,
      {
        defaultFileName: "archivo.txt",
        responseType: "text",
      },
      body,
      headers,
      parameters
    );
  }
}
