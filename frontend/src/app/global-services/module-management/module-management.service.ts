import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GLOBAL_MODULES_CONFIG, GlobalModuleConfig, ModuleStatus } from '../../config/modules.config';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ModuleManagementService {
  private availableModules$ = new BehaviorSubject<GlobalModuleConfig[]>(GLOBAL_MODULES_CONFIG);

  constructor() {
    this.initializeModules();
  }

  private initializeModules(): void {
    const filteredModules = this.filterModulesByEnvironment(GLOBAL_MODULES_CONFIG);
    this.availableModules$.next(filteredModules);
  }

  private filterModulesByEnvironment(modules: GlobalModuleConfig[]): GlobalModuleConfig[] {
    return modules.filter(module => {
      // Always exclude disabled modules
      if (module.status === ModuleStatus.DISABLED) {
        return false;
      }

      // In production, only show production-ready modules
      if (environment.production) {
        return module.status === ModuleStatus.PRODUCTION;
      }

      // In development/staging, show all non-disabled modules
      return true;
    }).sort((a, b) => a.order - b.order);
  }

  /**
   * Get all available modules for current environment
   */
  getAvailableModules(): Observable<GlobalModuleConfig[]> {
    return this.availableModules$.asObservable();
  }

  /**
   * Get modules by status
   */
  getModulesByStatus(status: ModuleStatus): Observable<GlobalModuleConfig[]> {
    return this.availableModules$.pipe(
      map(modules => modules.filter(module => module.status === status))
    );
  }

  /**
   * Check if a specific module is available
   */
  isModuleAvailable(moduleId: string): Observable<boolean> {
    return this.availableModules$.pipe(
      map(modules => modules.some(module => module.id === moduleId))
    );
  }

  /**
   * Get module configuration by ID
   */
  getModuleConfig(moduleId: string): Observable<GlobalModuleConfig | undefined> {
    return this.availableModules$.pipe(
      map(modules => modules.find(module => module.id === moduleId))
    );
  }

  /**
   * Manually override module availability (for admin/testing)
   */
  overrideModuleStatus(moduleId: string, status: ModuleStatus): void {
    const currentModules = this.availableModules$.value;
    const moduleIndex = currentModules.findIndex(m => m.id === moduleId);
    
    if (moduleIndex !== -1) {
      currentModules[moduleIndex].status = status;
      this.initializeModules(); // Re-filter based on new status
    }
  }

  /**
   * Get development info about modules (for debugging)
   */
  getModuleDebugInfo(): { [key: string]: any } {
    return {
      environment: environment.production ? 'production' : 'development',
      totalModules: GLOBAL_MODULES_CONFIG.length,
      availableModules: this.availableModules$.value.length,
      moduleStatuses: GLOBAL_MODULES_CONFIG.reduce((acc, module) => {
        acc[module.status] = (acc[module.status] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number })
    };
  }
}