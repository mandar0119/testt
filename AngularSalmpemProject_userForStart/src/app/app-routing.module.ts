import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './Authintication/auth.guard';

const routes: Routes = [
  // {path:'', redirectTo: '', pathMatch: 'prefix'},
  {path: '', loadChildren: () => import('./doctormaster/doctormaster.module').then(m => m.DoctormasterModule), canActivate:[AuthGuard]},
  {path:'login', loadChildren:()=>import('./loginmaster/loginmaster.module').then(m=>m.LoginmasterModule)},
  {path: 'admin', loadChildren:()=>import('./adminmaster/adminmaster.module').then(m=>m.AdminmasterModule)},
  {path: 'page-not-found',loadChildren:()=> import('./pagenotfound/pagenotfound.module').then(m=>m.PagenotfoundModule)},
  {path: '**', redirectTo: '/page-not-found'}
];

@NgModule({
  imports: [BrowserModule, BrowserAnimationsModule, RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
