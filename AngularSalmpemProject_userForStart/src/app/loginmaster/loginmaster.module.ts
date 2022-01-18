import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { LoginmasterRoutingModule } from './loginmaster-routing.module';
import { LoginmasterComponent } from './loginmaster.component';


@NgModule({
  declarations: [LoginmasterComponent],
  imports: [
    CommonModule,
    LoginmasterRoutingModule,
    FormsModule,
    NgbModule  
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginmasterModule { }
