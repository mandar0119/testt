import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
const API_URL = environment.apiUrl;
@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http:HttpClient) { }

  ImageURL(){
    return environment.ImageUrl;
  }

  login(data : any){
    return this.http.post(API_URL+ 'authentication/doctorLogin', data);
  }
}
