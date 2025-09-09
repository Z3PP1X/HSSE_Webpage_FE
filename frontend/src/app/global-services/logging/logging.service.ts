// src/app/global-services/logging/logging.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

@Injectable({ providedIn: 'root' })
export class LoggingService {

  private isEnabled = !!environment.features?.enableLogging;

  debug(...args: any[]) {
    if (this.isEnabled) console.log('[DEBUG]', ...args);
  }

  info(...args: any[]) {
    if (this.isEnabled) console.info('[INFO]', ...args);
  }

  warn(...args: any[]) {
    if (this.isEnabled) console.warn('[WARN]', ...args);
  }

  error(...args: any[]) {
    // Errors immer anzeigen
    console.error('[ERROR]', ...args);
  }

  scoped(scope: string) {
    return {
      debug: (...a: any[]) => this.debug(`[${scope}]`, ...a),
      info:  (...a: any[]) => this.info(`[${scope}]`, ...a),
      warn:  (...a: any[]) => this.warn(`[${scope}]`, ...a),
      error: (...a: any[]) => this.error(`[${scope}]`, ...a),
    };
  }
}