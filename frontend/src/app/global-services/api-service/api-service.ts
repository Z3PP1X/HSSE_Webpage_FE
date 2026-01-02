import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, catchError, throwError, retry } from "rxjs";
import { environment } from "../../../environments/environment";

// Simplified HttpOptions that matches Angular's HttpClient expectations
type HttpOptions = {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
    reportProgress?: boolean;
};

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;


    /**
     * Default headers for all requests
     */
    private getDefaultHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        });
    }

    /**
     * Build full URL with base URL from environment
     */
    private buildUrl(endpoint: string): string {
        if (!endpoint) return this.baseUrl;
        // Absolute URL – return as-is
        if (/^https?:\/\//i.test(endpoint)) return endpoint;

        let clean = endpoint.trim();

        // Remove leading slashes
        while (clean.startsWith('/')) clean = clean.slice(1);

        // If backend already prefixed with 'api/' and baseUrl ends with '/api', strip duplicate
        const baseEndsWithApi = this.baseUrl.endsWith('/api');
        if (baseEndsWithApi && clean.startsWith('api/')) {
            clean = clean.slice(4); // remove 'api/'
        }

        // Ensure single slash join
        return `${this.baseUrl}/${clean}`;
    }

    /**
     * Merge default headers with custom headers
     */
    private prepareOptions(options?: HttpOptions): HttpOptions {
        const defaultHeaders = this.getDefaultHeaders();

        let mergedHeaders = defaultHeaders;
        if (options?.headers) {
            if (options.headers instanceof HttpHeaders) {
                // Merge HttpHeaders - properly call the get method
                const httpHeaders = options.headers as HttpHeaders;
                httpHeaders.keys().forEach(key => {
                    const value = httpHeaders.get(key);
                    if (value !== null) {
                        mergedHeaders = mergedHeaders.set(key, value);
                    }
                });
            } else {
                // Merge object headers
                const headerObj = options.headers as { [header: string]: string | string[] };
                Object.keys(headerObj).forEach(key => {
                    const value = headerObj[key];
                    mergedHeaders = mergedHeaders.set(key, Array.isArray(value) ? value.join(',') : value.toString());
                });
            }
        }

        return {
            ...options,
            headers: mergedHeaders
        };
    }

    /**
     * GET request
     */
    get<T>(endpoint: string, options?: HttpOptions): Observable<T> {
        const url = this.buildUrl(endpoint);
        const preparedOptions = this.prepareOptions(options);

        console.log('🚀 [ApiService] GET Request to:', url);

        return this.http.get<T>(url, preparedOptions).pipe(
            retry(2),
            catchError(this.handleError)
        );
    }

    /**
     * POST request
     */
    post<T>(endpoint: string, body: any, options?: HttpOptions): Observable<T> {
        const url = this.buildUrl(endpoint);
        const preparedOptions = this.prepareOptions(options);

        return this.http.post<T>(url, body, preparedOptions).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * PUT request
     */
    put<T>(endpoint: string, body: any, options?: HttpOptions): Observable<T> {
        const url = this.buildUrl(endpoint);
        const preparedOptions = this.prepareOptions(options);

        return this.http.put<T>(url, body, preparedOptions).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * PATCH request
     */
    patch<T>(endpoint: string, body: any, options?: HttpOptions): Observable<T> {
        const url = this.buildUrl(endpoint);
        const preparedOptions = this.prepareOptions(options);

        return this.http.patch<T>(url, body, preparedOptions).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * DELETE request
     */
    delete<T>(endpoint: string, options?: HttpOptions): Observable<T> {
        const url = this.buildUrl(endpoint);
        const preparedOptions = this.prepareOptions(options);

        return this.http.delete<T>(url, preparedOptions).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Upload file
     */
    upload<T>(endpoint: string, file: File, additionalData?: any): Observable<T> {
        const url = this.buildUrl(endpoint);
        const formData = new FormData();

        formData.append('file', file);

        if (additionalData) {
            Object.keys(additionalData).forEach(key => {
                formData.append(key, additionalData[key]);
            });
        }

        // Don't set Content-Type header for file uploads
        const options = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };

        return this.http.post<T>(url, formData, options).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Download file - returns Blob specifically
     */
    download(endpoint: string): Observable<Blob> {
        const url = this.buildUrl(endpoint);

        return this.http.get(url, {
            responseType: 'blob',
            headers: this.getDefaultHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Build query parameters helper
     */
    buildParams(params: { [key: string]: any }): HttpParams {
        let httpParams = new HttpParams();

        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                httpParams = httpParams.set(key, params[key].toString());
            }
        });

        return httpParams;
    }

    /**
     * Check if API is available
     */
    healthCheck(): Observable<any> {
        return this.get('health').pipe(
            catchError(() => throwError(() => new Error('API is not available')))
        );
    }

    /**
     * Get current environment info
     */
    getEnvironmentInfo() {
        return {
            production: environment.production,
            apiBaseUrl: this.baseUrl
        };
    }

    /**
     * Error handling
     */
    private handleError = (error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred!';
        let errorCode = 'UNKNOWN_ERROR';

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Client Error: ${error.error.message}`;
            errorCode = 'CLIENT_ERROR';
        } else {
            // Server-side error
            errorCode = `SERVER_ERROR_${error.status}`;

            switch (error.status) {
                case 400:
                    errorMessage = 'Bad Request - Please check your input';
                    break;
                case 401:
                    errorMessage = 'Unauthorized - Please login again';
                    break;
                case 403:
                    errorMessage = 'Forbidden - You do not have permission';
                    break;
                case 404:
                    errorMessage = 'Not Found - The requested resource was not found';
                    break;
                case 422:
                    errorMessage = 'Validation Error - Please check your input';
                    break;
                case 500:
                    errorMessage = 'Internal Server Error - Please try again later';
                    break;
                default:
                    errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
            }

            // Try to extract server error message
            if (error.error?.message) {
                errorMessage = error.error.message;
            }
        }

        console.error(`API Error [${errorCode}]:`, errorMessage, error);

        return throwError(() => ({
            code: errorCode,
            message: errorMessage,
            originalError: error
        }));
    }
}