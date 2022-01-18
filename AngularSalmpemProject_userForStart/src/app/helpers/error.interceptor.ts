import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoaderService } from '../services/loader/loader.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private loaderservice: LoaderService,public router: Router) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe( tap(evt => {
            this.loaderservice.hide();
            // if (evt instanceof HttpResponse) {
            //     if (evt.headers.get("X-COUNT") != "OK") {
            //         this.modalService.dismissAll();
            //         setTimeout(()=>{
            //             this.customAlert.confirm("", evt.headers.get("X-COUNT"), "Activate Now", "cancel", "sm", true, true);
            //             this.loaderservice.hide();
            //         },300)
            //     }else{
            //         this.loaderservice.hide();
            //         this.customAlert.dismiss();
            //     }
            // }
        }),catchError(err => {
            if (err) {
                // auto logout if 401 response returned from api
                localStorage.removeItem('isOPDLOGIN');
                localStorage.removeItem('OPDTOK');
                if(err.status == 403 || err.status == 401){
                    if (err.status != 403) return throwError(err);
                    this.router.navigate(['page-not-found']);
                }else{
                    this.router.navigate(['login']);
                }
            }
            this.loaderservice.hide();
            if (err.status == 400) {
                var error : any = err.error || { Message: "Please try after some time."};
            } else {
                var error : any = err.error || { Message: "Please try after some time."};
            }
            // const error = err.error.message || err.statusText;
            
            return throwError(error);
        }))
    }
}