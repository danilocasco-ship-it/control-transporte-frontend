import { environment } from "src/environments/environment";

export const GlobalComponent = {
  // Api Calling
  API_URL: "https://api-node.themesbrand.website/",
  headerToken: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },

  // Auth Api
  // Se toma del environment correspondiente en lugar de estar fijo aqui, para
  // que desarrollo pueda pasar por el proxy de ng serve y funcione igual desde
  // esta PC y desde un telefono en la misma red.
   // AUTH_API: "https://api-node.themesbrand.website/auth/",
  AUTH_API: environment.authApi,
  //AUTH_API: "https://172.16.0.16:8097/",
  // Products Api
  product: "apps/product",
  productDelete: "apps/product/",

  // Orders Api
  order: "apps/order",
  orderId: "apps/order/",

  // Customers Api
  customer: "apps/customer",
};
