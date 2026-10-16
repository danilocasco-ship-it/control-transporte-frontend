# Guía de Publicación - Control de Transporte

Publicación del sistema en el servidor de aplicaciones IIS.

## Datos de entorno

| Elemento | Valor |
|---|---|
| Servidor de aplicaciones (IIS) | `172.16.0.67` |
| Servidor de base de datos SQL | `176.16.0.75` |
| Frontend (Angular 18) | `C:\Proyectos\control-transporte-frontend` |
| Backend (ASP.NET Core 8) | `C:\Proyectos\control-transporte-backend\API_CONTROL_TRANSPORTE` |
| Puerto API backend | `8097` |
| Puerto frontend (IIS) | `4203` |
| Portal de login externo | `8065` (API) / `8066` (app) |

## Arquitectura

```
Movil / PC
   |  http://172.16.0.67:4203      -> Frontend Angular (IIS)
   |  http://172.16.0.67:8097      -> Backend API (IIS)
   v
Backend API  ->  176.16.0.75:1433   (SQL Server)
```

> El frontend **nunca** se conecta a SQL. Solo el backend tiene la cadena de conexión.

---

## Requisitos previos en el servidor

1. **IIS** instalado y activo.
2. **.NET 8 Hosting Bundle** instalado (ASP.NET Core Runtime + ANCM):
   - Descargar de: https://dotnet.microsoft.com/download/dotnet/8.0 (Hosting Bundle)
   - Reiniciar IIS después de instalarlo: `iisreset`
3. Módulo **URL Rewrite** de IIS (necesario para el ruteo SPA de Angular):
   - https://www.iis.net/downloads/microsoft/url-rewrite

---

## Paso 1 - Compilar el Frontend (Angular)

Desde `C:\Proyectos\control-transporte-frontend`:

```powershell
npm install
npx ng build --configuration production
```

La salida queda en la carpeta `dist\`. Contiene `index.html`, los `.js`, `assets\` y el `web.config` (rewrite de rutas Angular).

### Copiar al servidor IIS

```powershell
# Crear el directorio destino
New-Item -ItemType Directory -Path C:\inetpub\wwwroot\control-transporte -Force

# Copiar el contenido de dist (ojo: el contenido, no la carpeta dist)
Copy-Item -Path .\dist\* -Destination C:\inetpub\wwwroot\control-transporte -Recurse -Force
```

### Configuración del frontend

Archivo: `src\environments\environment.prod.ts` (ya ajustado):

```ts
export const environment = {
  production: true,
  authApi: 'http://172.16.0.67:8097/',
  apiUrl: 'http://172.16.0.67:8097/',
  portalAuth: {
    urlAppLogin: 'http://172.16.0.67:8066',
    urlApiLogin: 'http://172.16.0.67:8065/api',
    urlApiModulo: 'http://172.16.0.67:8097/api'
  }
};
```

> IMPORTANTE: `authApi` **no** puede quedar en `localhost`, porque en el móvil `localhost` apunta al propio teléfono.

---

## Paso 2 - Publicar el Backend (ASP.NET Core)

Desde `C:\Proyectos\control-transporte-backend\API_CONTROL_TRANSPORTE`:

```powershell
dotnet publish "API_CONTROL_TRANSPORTE.sln" -c Release -o C:\inetpub\api-control-transporte --nologo
```

La publicación genera automáticamente su propio `web.config` (con el módulo ANCM).

### Configuración del backend

Archivo: `API_CONTROL_TRANSPORTE\appsettings.json` (cadenas de conexión - ya apuntan a la BD):

```json
"ConnectionStrings": {
  "ConnectionGlobal":  "Data Source=176.16.0.75;Initial Catalog=negocios_g;User Id=sr2008;Password=2008;TrustServerCertificate=True;",
  "ConnectionSalazar": "Data Source=192.168.1.2;Initial Catalog=negocios;User Id=sr2008;Password=2008;TrustServerCertificate=True;",
  "ConnectionFenix":   "Data Source=192.168.10.2;Initial Catalog=negocios_f;User Id=sr2008;Password=2008;TrustServerCertificate=True;"
}
```

> Multi-empresa (`Configuration\ConnectionDb\Connection.cs`):
> - `codempresa = 9` -> `ConnectionGlobal` = `176.16.0.75` (BD principal)
> - `codempresa = 1` -> `ConnectionSalazar` = `192.168.1.2`
> - `codempresa = 5` -> `ConnectionFenix` = `192.168.10.2`
>
> Si solo se usa la empresa Global, no hay que tocar nada. Si se usan Salazar/Fenix, verificar conectividad hacia esas IPs.

Archivo: `API_CONTROL_TRANSPORTE\appsettings.Production.json` (ya ajustado):

```json
{
  "PortalLogin": {
    "Activo": true,
    "Slug": "control-transporte",
    "UrlFrontend": "http://172.16.0.67:4203",
    "SegundosExpiracionSesion": 90,
    "JwtHandoff": {
      "Key": "aWaS25B20ucEZM2NgCmwfyhgrfFYMm1s",
      "Issuer": "http://172.16.0.67:8065",
      "Audience": "http://172.16.0.67:8065"
    }
  }
}
```

> Si en producción necesitas un `ConnectionStrings` distinto, agrégalo también en `appsettings.Production.json` (sobrescribe al de `appsettings.json`).

Archivo: `API_CONTROL_TRANSPORTE\Program.cs` (ya ajustado):

```csharp
// Escucha en todas las interfaces para que sea accesible por IP desde la red.
// Si se publica detras de IIS, IIS controla el puerto 8097 y esto se ignora.
builder.WebHost.UseUrls("http://0.0.0.0:8097");
```

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",
                "http://localhost:4201",
                "http://localhost:4203",
                "http://172.16.0.67",
                "http://172.16.0.67:4203")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .WithExposedHeaders("Content-Disposition");
    });
});
```

> CORS es obligatorio: el navegador llama a `http://172.16.0.67:8097` desde el origen `http://172.16.0.67:4203` (puerto distinto = cross-origin).

---

## Paso 3 - Crear los sitios en IIS

### Backend (API)

1. **Application Pools** -> Add Application Pool:
   - Name: `ApiControlTransportePool`
   - .NET CLR version: **No Managed Code**
2. **Sites** -> Add Website:
   - Site name: `ApiControlTransporte`
   - Application pool: `ApiControlTransportePool`
   - Physical path: `C:\inetpub\api-control-transporte`
   - Binding: type `http`, IP **All Unassigned**, port **8097**, host name vacío.
3. Dar permisos de lectura a `IIS_IUSRS` sobre la carpeta:
   ```powershell
   icacls "C:\inetpub\api-control-transporte" /grant "IIS_IUSRS:(OI)(CI)R"
   ```

### Frontend (Angular)

1. **Sites** -> Add Website:
   - Site name: `ControlTransporte`
   - Application pool: `DefaultAppPool` (o uno dedicado)
   - Physical path: `C:\inetpub\wwwroot\control-transporte`
   - Binding: type `http`, IP **All Unassigned**, port **4203**, host name vacío.
2. Verificar que el `web.config` de la carpeta raíz del sitio sea el de Angular (con la regla de rewrite).

---

## Paso 4 - Firewall de Windows

En el servidor `172.16.0.67`:

```powershell
New-NetFirewallRule -DisplayName "Control Transporte - Frontend 4203" -Direction Inbound -Protocol TCP -LocalPort 4203 -Action Allow
New-NetFirewallRule -DisplayName "Control Transporte - API 8097" -Direction Inbound -Protocol TCP -LocalPort 8097 -Action Allow
```

Si el portal de login está en este mismo servidor, abrir también `8065` y `8066`.

---

## Paso 5 - Verificaciones

### Conectividad hacia la base de datos (desde el servidor de aplicaciones)

```powershell
Test-NetConnection -ComputerName 176.16.0.75 -Port 1433
```

- `TcpTestSucceeded : True` -> OK.
- Si `False`: revisar firewall de red entre servidores y que SQL Server tenga **TCP/IP habilitado** (SQL Server Configuration Manager), puerto `1433` a la escucha.

### API

En el navegador del servidor:
```
http://172.16.0.67:8097/swagger   (solo en entorno Development)
```
O cualquier endpoint conocido: `http://172.16.0.67:8097/api/...`

### Frontend

En el navegador del servidor:
```
http://172.16.0.67:4203
```

### Desde el móvil

1. El teléfono debe estar en la **misma red/WiFi** que `172.16.0.67`.
2. Abrir: `http://172.16.0.67:4203`
3. Si no carga:
   - Probar `ping 172.16.0.67` desde el móvil.
   - Revisar las reglas de firewall de `4203` y `8097`.
   - Abrir la consola del navegador (o la pestaña Network) para ver errores CORS o `localhost`.

---

## Paso 6 - Publicar el portal de login (si aplica)

`PortalLogin.Activo = true`, así que el login redirige a un portal externo. Este portal debe estar publicado y accesible en `172.16.0.67`:

- API del portal: puerto `8065`
- App del portal: puerto `8066`

Si el portal no está publicado en este servidor, poner `"Activo": false` en `appsettings.Production.json` (o mover la lógica de login).

---

## Solución de problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| 502.5 / 500.30 al abrir el sitio | Falta el .NET Hosting Bundle o el App Pool no es "No Managed Code" | Instalar Hosting Bundle, `iisreset`, corregir App Pool |
| 404 al refrescar una ruta Angular (ej. /dashboard) | Falta el módulo URL Rewrite o el `web.config` | Instalar URL Rewrite, verificar el `web.config` |
| En el móvil "no se puede conectar" | Firewall o IP incorrecta | Abrir puertos, verificar red, `ping` |
| Error CORS en consola | Origen no permitido | Agregar la URL exacta a `WithOrigins` y republicar |
| Login no funciona / 401 | Portal no publicado o JWT | Revisar `PortalLogin`, `Jwt:Key`, reloj del servidor |
| Error de conexión a BD | Firewall / SQL sin TCP / usuario | `Test-NetConnection`, habilitar TCP/IP, revisar credenciales |
| Los `.js` no cargan (blanco) | `baseHref` / rewrite mal configurado | Verificar `web.config` y binding del sitio |

---

## Comandos resumen (copiar/pegar en el servidor)

```powershell
# 1. Frontend
cd C:\Proyectos\control-transporte-frontend
npm install
npx ng build --configuration production
New-Item -ItemType Directory -Path C:\inetpub\wwwroot\control-transporte -Force
Copy-Item -Path .\dist\* -Destination C:\inetpub\wwwroot\control-transporte -Recurse -Force

# 2. Backend
cd C:\Proyectos\control-transporte-backend\API_CONTROL_TRANSPORTE
dotnet publish "API_CONTROL_TRANSPORTE.sln" -c Release -o C:\inetpub\api-control-transporte --nologo

# 3. Permisos
icacls "C:\inetpub\api-control-transporte" /grant "IIS_IUSRS:(OI)(CI)R"
icacls "C:\inetpub\wwwroot\control-transporte" /grant "IIS_IUSRS:(OI)(CI)R"

# 4. Firewall
New-NetFirewallRule -DisplayName "Control Transporte - Frontend 4203" -Direction Inbound -Protocol TCP -LocalPort 4203 -Action Allow
New-NetFirewallRule -DisplayName "Control Transporte - API 8097" -Direction Inbound -Protocol TCP -LocalPort 8097 -Action Allow

# 5. Reiniciar IIS
iisreset

# 6. Verificar BD
Test-NetConnection -ComputerName 176.16.0.75 -Port 1433
```
