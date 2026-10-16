import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { FormulariosRoutingModule } from "./formularios-routing.module";
import {
  NgbPaginationModule,
  NgbHighlight,
  NgbDropdownModule,
  NgbTypeaheadModule,
  NgbPopoverModule,
} from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from "@ng-select/ng-select";
import { GenericTableComponent } from "./genericos/generictable/generictable.component";
import { GenericModalDialogComponent } from "./genericos/generic-modal-dialog/generic-modal-dialog.component";
import { AccessDeniedComponent } from "./acceso/access-denied/access-denied.component";
import { TokenExpiredComponent } from "./acceso/token-expired/token-expired.component";

@NgModule({
  declarations: [
    GenericTableComponent,
    GenericModalDialogComponent,
    AccessDeniedComponent,
    TokenExpiredComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FormulariosRoutingModule,
    NgbPaginationModule,
    NgbHighlight,
    NgbDropdownModule,
    NgbTypeaheadModule,
    NgbPopoverModule,
    NgSelectModule,
  ],
  exports: [GenericTableComponent, GenericModalDialogComponent],
})
export class FormulariosModule {}
