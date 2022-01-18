import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoctormasterRoutingModule } from './doctormaster-routing.module';
import { DoctormasterComponent } from './doctormaster.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderModule } from '../page-header/page-header.module';


@NgModule({
  declarations: [DoctormasterComponent, SidebarComponent, HeaderComponent],
  imports: [
    CommonModule,
    DoctormasterRoutingModule,
    NgbDropdownModule,
    PageHeaderModule
  ]
})
export class DoctormasterModule { }
