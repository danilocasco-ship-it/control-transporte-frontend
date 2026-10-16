export const environment = {
  production: false,
  // Base de la API en desarrollo: ruta relativa para que las peticiones salgan
  // por el proxy de ng serve (proxy.conf.json -> http://localhost:8097). Asi
  // funciona igual desde esta PC y desde un telefono en la misma red, porque el
  // navegador del telefono ya no tiene que resolver "localhost".
  authApi: '/',
  apiUrl: 'http://localhost:8097/',
  portalAuth: {
    urlAppLogin: 'http://localhost:4201',
    urlApiLogin: 'http://localhost:8080/api',
    urlApiModulo: 'http://localhost:8097/api'
  }
};
