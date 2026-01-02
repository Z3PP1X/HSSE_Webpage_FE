import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AppConfigService {
    private config: any = null;
    private http = inject(HttpClient);

    async loadConfig(): Promise<void> {
        try {
            this.config = await firstValueFrom(this.http.get('/config.json'));
        } catch (e) {
            console.warn('Could not load config.json, falling back to environment', e);
            this.config = {};
        }
    }

    get apiBaseUrl(): string {
        return this.config?.apiBaseUrl || environment.apiBaseUrl;
    }
}

export function loadConfig(configService: AppConfigService) {
    return () => configService.loadConfig();
}
