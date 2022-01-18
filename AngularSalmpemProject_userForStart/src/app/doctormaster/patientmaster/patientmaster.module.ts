import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PatientmasterRoutingModule } from './patientmaster-routing.module';
import { PatientmasterComponent } from './patientmaster.component';


@NgModule({
  declarations: [PatientmasterComponent],
  imports: [
    CommonModule,
    PatientmasterRoutingModule
  ]
})
export class PatientmasterModule { }
