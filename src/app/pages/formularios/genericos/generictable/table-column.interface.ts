// table-column.interface.ts
export interface TableColumn {
  property: string;
  header: string;
  sortable?: boolean;
  type?: "text" | "date" | "number";
  format?: string;
  defaultValue?: string;
  hidden?: boolean; // Nueva propiedad para ocultar columnas
}
