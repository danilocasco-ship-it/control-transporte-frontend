import { MenuItem } from "./menu.model";

export const MENU: MenuItem[] = [
  {
    id: 1,
    label: "MENUITEMS.MENU.TEXT",
    isTitle: true,
  },
  {
    id: 2,
    label: "Inicio",
    icon: "mdi mdi-speedometer",
    link: "/",
  },
  {
    id: 3,
    label: "MANTENIMIENTO",
    isTitle: true,
  },
  {
    id: 4,
    label: "Proveedores",
    icon: "mdi mdi-account-group",
    isCollapsed: true,
    subItems: [
      {
        id: 5,
        label: "Nuevo Proveedor",
        link: "/proveedores",
        parentId: 4,
      },
      {
        id: 6,
        label: "Lista de Proveedores",
        link: "/proveedores-lista",
        parentId: 4,
      },
    ],
  },
  {
    id: 7,
    label: "Equipos",
    icon: "mdi mdi-excavator",
    isCollapsed: true,
    subItems: [
      {
        id: 8,
        label: "Nuevo Equipo",
        link: "/equipos",
        parentId: 7,
      },
      {
        id: 9,
        label: "Lista de Equipos",
        link: "/equipos-lista",
        parentId: 7,
      },
    ],
  },
  {
    id: 10,
    label: "OPERACIONES",
    isTitle: true,
  },
  {
    id: 11,
    label: "Préstamos de Equipos",
    icon: "mdi mdi-clipboard-text-outline",
    isCollapsed: true,
    subItems: [
      {
        id: 12,
        label: "Nuevo Préstamo",
        link: "/prestamos-equipos",
        parentId: 11,
      },
      {
        id: 13,
        label: "Lista de Préstamos",
        link: "/prestamos-equipos-lista",
        parentId: 11,
      },
    ],
  },
  {
    id: 14,
    label: "REPORTES",
    isTitle: true,
  },
  {
    id: 15,
    label: "Listado de Proveedores",
    icon: "mdi mdi-file-account-outline",
    link: "/reportes/proveedores",
  },
  {
    id: 16,
    label: "Listado de Equipos",
    icon: "mdi mdi-file-table-outline",
    link: "/reportes/equipos",
  },
];