import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ModuleConfigurationItem } from "../../components/module-navigation/interfaces/module-content.config.model";
import { environment } from "../../../environments/environment";
import { ModuleMenu } from "../../components/module-navigation/interfaces/module-content.config.model";

@Injectable({
    providedIn: 'root'
})

// module-navigation.service.ts
@Injectable({
    providedIn: 'root'
  })
  export class ModuleNavigationService {
    private activeModuleId = new BehaviorSubject<string>('');
    private activeMenuId = new BehaviorSubject<string>('');
    
    activeModule$ = this.activeModuleId.asObservable();
    activeMenu$ = this.activeMenuId.asObservable();
    
    constructor() {}
    
    setActiveModule(moduleId: string) {
      this.activeModuleId.next(moduleId);
    }
    
    setActiveMenu(menuId: string) {
      this.activeMenuId.next(menuId);
    }
    
    getActiveMenu(config: ModuleConfigurationItem[]): ModuleMenu | undefined {
      const moduleConfig = config[0];
      return moduleConfig?.menus?.find(menu => menu.menuId === this.activeMenuId.value);
    }
    
    findFormEndpoint(config: ModuleConfigurationItem[], formName: string): string | undefined {
      const activeMenu = this.getActiveMenu(config);
      const forms = activeMenu?.forms;
      
      if (!forms) return undefined;
      
      const formConfig = forms.find(form => form.name === formName);
      return formConfig ? `${environment.apiBaseUrl}/${formConfig.path}` : undefined;
    }
    
    // Handle initial configuration
    initializeFromConfig(config: ModuleConfigurationItem[]) {
      const moduleConfig = config[0];
      if (moduleConfig) {
        // Set default menu if available
        const defaultMenu = moduleConfig.defaultMenu || 
                           (moduleConfig.menus?.length > 0 ? moduleConfig.menus[0].menuId : '');
        this.setActiveMenu(defaultMenu);
      }
    }
  }