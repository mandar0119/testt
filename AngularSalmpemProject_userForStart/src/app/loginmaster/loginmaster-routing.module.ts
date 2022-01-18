import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginmasterComponent } from './loginmaster.component';

const routes: Routes = [{
  path:'', component:LoginmasterComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginmasterRoutingModule { }
