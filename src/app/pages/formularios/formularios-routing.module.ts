import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AccessDeniedComponent } from "./acceso/access-denied/access-denied.component";
import { TokenExpiredComponent } from "./acceso/token-expired/token-expired.component";

const routes: Routes = [
  {
    path: "access-denied",
    component: AccessDeniedComponent,
  },
  {
    path: "token-expired",
    component: TokenExpiredComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormulariosRoutingModule {}
