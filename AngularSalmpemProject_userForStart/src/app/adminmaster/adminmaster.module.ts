import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminmasterRoutingModule } from './adminmaster-routing.module';
import { AdminmasterComponent } from './adminmaster.component';


@NgModule({
  declarations: [AdminmasterComponent],
  imports: [
    CommonModule,
    AdminmasterRoutingModule
  ]
})
export class AdminmasterModule { }
