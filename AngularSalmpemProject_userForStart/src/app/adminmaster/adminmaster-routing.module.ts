import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminmasterComponent } from './adminmaster.component';

const routes: Routes = [{
  path:'', component:AdminmasterComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminmasterRoutingModule { }
