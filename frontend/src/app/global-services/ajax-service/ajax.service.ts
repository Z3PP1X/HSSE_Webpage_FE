import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, catchError, throwError, retry } from "rxjs";

type HttpOptions = {
    headers?: HttpHeaders | { [header: string]: string | string[]};
    params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[]};
    body?: any;
};

@Injectable({ providedIn: 'root'})
export class ApiService {
    private http = inject(HttpClient);

    get<T>(url: string, options?: HttpOptions): Observable<T> {
        return this.http.get<T>(url,options).pipe(
            retry(2),
            catchError(this.handleError)
        );
    }

    put<T>(url: string, body: any, options?: HttpOptions): Observable<T> {
        return this.http.put<T>(url, body, options).pipe(catchError(this.handleError));
    }

    delete<T>(url: string, options?: HttpOptions): Observable<T> {
        return this.http.delete<T>(url, options).pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'An unknown error occurred!';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        
        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
      }
}