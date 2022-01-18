import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../Authintication/auth.service';
import { LoginService } from './login.service';

@Component({
  selector: 'app-loginmaster',
  templateUrl: './loginmaster.component.html',
  styleUrls: ['./loginmaster.component.scss']
})
export class LoginmasterComponent implements OnInit {
  userdataa :any;
  constructor(public router: Router, private auth: AuthService, public toaster :ToastrService, private loginservice : LoginService) { }

  ngOnInit() {
    if(this.auth.isAuthenticated()){
      this.auth.redirectifAuthinticated();
    }
    this.userdataa =  { userna: '',password: ''};
  }

  onLoggedin(data: any){
    this.loginservice.login({ username : data.userna, password: data.password}).subscribe((res:any)=>{
      if (res.status == 1) {
        localStorage.setItem('OPDTOK', JSON.stringify(res.token));
        localStorage.setItem('isOPDLOGIN', 'true');     
        this.toaster.success(res.Message,'',{closeButton:true})
        this.router.navigate(['/']); 
      } else {
        this.toaster.error(res.Message,'', {closeButton:true})
      }
    },(error)=>{
      this.toaster.error(error.error.Message, '', {closeButton:true});
    })
  }

}
