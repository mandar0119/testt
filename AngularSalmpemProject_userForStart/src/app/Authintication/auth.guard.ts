import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from './auth.service';
import { CanActivate } from '@angular/router';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements  CanActivate {
  constructor(private router: Router, public auth: AuthService) {}
  canActivate(route: ActivatedRouteSnapshot) {
    // const expectedRole = route.data.expectedRole;
    if ( localStorage.getItem('isOPDLOGIN')) {
        return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
