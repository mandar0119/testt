import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagenotfoundRoutingModule } from './pagenotfound-routing.module';
import { PagenotfoundComponent } from './pagenotfound.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { DemoMaterialModule } from '../material-module';

@NgModule({
  declarations: [PagenotfoundComponent],
  imports: [
    CommonModule,
    PagenotfoundRoutingModule,
    DemoMaterialModule,
    MatNativeDateModule
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class PagenotfoundModule { }
