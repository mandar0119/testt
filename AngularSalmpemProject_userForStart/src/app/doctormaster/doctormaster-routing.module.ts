import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DoctormasterComponent } from './doctormaster.component';

const routes: Routes = [{
  path:'', component: DoctormasterComponent,
  children:[
    { path: '', redirectTo: 'patient', pathMatch: 'prefix' },
    {path:'dashboard', loadChildren: ()=>import('./dashboard/dashboard.module').then(m=>m.DashboardModule)},
    {path:'patient', loadChildren:()=>import('./patientmaster/patientmaster.module').then(m=>m.PatientmasterModule)}
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctormasterRoutingModule { }
