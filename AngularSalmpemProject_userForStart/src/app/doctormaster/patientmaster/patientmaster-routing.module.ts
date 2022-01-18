import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PatientmasterComponent } from './patientmaster.component';

const routes: Routes = [{
  path:'', component:PatientmasterComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientmasterRoutingModule { }
