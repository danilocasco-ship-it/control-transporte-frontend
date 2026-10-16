import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
//  DANILO 16092026
import { ProveedorFormComponent } from "./proveedores/proveedor-form.component";
import { ProveedorListComponent } from './proveedores/proveedor-list.component';
import { EquipoFormComponent } from './equipos/equipo-form.component';
import { EquipoListComponent } from './equipos/equipo-list.component';
import { PrestamoEquipoFormComponent } from './prestamos-equipos/prestamo-equipo-form.component';
import { PrestamoEquipoListComponent } from './prestamos-equipos/prestamo-equipo-list.component';
import { ReporteProveedoresComponent } from './reportes/reporte-proveedores/reporte-proveedores.component';
import { ReporteEquiposComponent } from './reportes/reporte-equipos/reporte-equipos.component';

const routes: Routes = [
  { path: 'proveedores', component: ProveedorFormComponent },  
  { path: 'proveedores-lista', component: ProveedorListComponent },
  { path: 'proveedores/editar/:codempresa/:codproveedor', component: ProveedorFormComponent },
  { path: 'equipos', component: EquipoFormComponent },
  { path: 'equipos-lista', component: EquipoListComponent },
  { path: 'equipos/editar/:codempresa/:codequipo', component: EquipoFormComponent },
  { path: 'prestamos-equipos', component: PrestamoEquipoFormComponent },
  { path: 'prestamos-equipos-lista', component: PrestamoEquipoListComponent },
  { path: 'prestamos-equipos/editar/:codempresa/:codsucursal/:codcontratista/:codequipo', component: PrestamoEquipoFormComponent },
  { path: 'reportes/proveedores', component: ReporteProveedoresComponent },
  { path: 'reportes/equipos', component: ReporteEquiposComponent },
  {
    path: "",
    component: HomeComponent,
  },
  {
    path: "formularios",
    loadChildren: () =>
      import("./formularios/formularios.module").then(
        (m) => m.FormulariosModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
