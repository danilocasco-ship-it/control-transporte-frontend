import { Component } from "@angular/core";

interface MobileNavItem {
  label: string;
  link: string;
  icon: string;
  /** true -> routerLinkActive solo marca activo con coincidencia exacta */
  exact?: boolean;
}

/**
 * Barra de navegacion inferior para movil.
 *
 * Da acceso directo (un toque) a los modulos principales del sistema, que es
 * lo que el sidebar off-canvas no resuelve bien en un telefono: alli hacen
 * falta dos toques (hamburguesa + opcion) y el menu tapa la pantalla.
 *
 * La barra solo se muestra por debajo de md (768px) — ver su propio SCSS —,
 * de modo que la vista de escritorio conserva la navegacion por sidebar sin
 * ningun cambio.
 */
@Component({
  selector: "app-mobile-nav",
  templateUrl: "./mobile-nav.component.html",
  styleUrls: ["./mobile-nav.component.scss"],
})
export class MobileNavComponent {
  readonly items: MobileNavItem[] = [
    { label: "Inicio", link: "/", icon: "mdi mdi-home-outline", exact: true },
    {
      label: "Proveedores",
      link: "/proveedores-lista",
      icon: "mdi mdi-account-group-outline",
    },
    { label: "Equipos", link: "/equipos-lista", icon: "mdi mdi-excavator" },
    {
      label: "Prestamos",
      link: "/prestamos-equipos-lista",
      icon: "mdi mdi-clipboard-text-outline",
    },
    {
      label: "Reportes",
      link: "/reportes/equipos",
      icon: "mdi mdi-file-table-outline",
    },
  ];
}
