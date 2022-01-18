import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { LoaderService } from '../services/loader/loader.service';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private loaderservice: LoaderService, public toaster: ToastrService) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        // add authorization header with jwt token if available
        // var token = JSON.parse(localStorage.getItem("OPDTOK") || '{}');
        // if (token.OPDTOK) {
        //     request = request.clone({
        //         setHeaders: { Authorization: token }
        //     });
        // }
        // return next.handle(request)

        // check to see if there's internet
        if (window.navigator.onLine) {
            // add authorization header with jwt token if available
            var token = JSON.parse(localStorage.getItem('OPDTOK')  || '{}');
            if (token.OPDTOK) {
                request = request.clone({
                    setHeaders: { Authorization: token }
                });
            }
            return next.handle(request).pipe(
                finalize(() => this.loaderservice.hide())
            );

        } else {
            // return Observable.throw(new HttpErrorResponse({ error: 'Internet is required.' }));
            // this.loaderservice.hide()
            return throwError(new HttpErrorResponse({ error: {Message:'Plese check internet connection.'} }));
        }
    }
}