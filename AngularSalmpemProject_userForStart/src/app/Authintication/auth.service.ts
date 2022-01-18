import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

  public isAuthenticated(): boolean {
    const user = {
      islogin : localStorage.getItem('isOPDLOGIN')
    }
    if(user.islogin){
      return true;
    }else{
      return false;
    }
  }

  redirectifAuthinticated(){
    if (localStorage.getItem('isOPDLOGIN')){
      this.router.navigate(['/']);
    }else{
      this.router.navigate(['/login']);
    }
  }
}
