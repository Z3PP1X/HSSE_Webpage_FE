import { Injectable, signal } from '@angular/core';
import { ModuleConfigurationItem } from '../../components/module-navigation/interfaces/module-content.config.model';
import { SafetyModuleConfig } from '../../modules/safety-module/safety-module.config';

// Import other configs as they become available

@Injectable({
    providedIn: 'root'
})
export class NavbarNavigationService {

    // State for the drawer
    isOpen = signal(false);
    activeModuleId = signal<string | null>(null);
    activeConfig = signal<ModuleConfigurationItem[]>([]);
    activeIconPath = signal<string>('');

    // Registry of configurations
    // In a real app this might be loaded lazily or via a provider, but for now we register known ones
    private configRegistry: { [key: string]: { config: any, icon: string } } = {
        'safety-module': {
            config: SafetyModuleConfig,
            icon: 'ehs-icons/safety-white.svg'
        },
        // Placeholders for other modules to prevent errors if clicked
        'health-module': { config: { moduleTitle: 'Health', menus: [] }, icon: 'ehs-icons/health-white.svg' },
        'account-module': { config: { moduleTitle: 'Account', menus: [] }, icon: 'ehs-icons/person-white.svg' },
        'reporting-module': { config: { moduleTitle: 'Reporting', menus: [] }, icon: 'ehs-icons/report-white.svg' },
        'emergency-contacts': { config: { moduleTitle: 'Emergency', menus: [] }, icon: 'ehs-icons/phone.svg' },
    };

    /**
     * Toggle the drawer for a specific module
     */
    toggleDrawer(moduleId: string) {
        if (this.activeModuleId() === moduleId && this.isOpen()) {
            // If clicking same module and open -> close it
            this.closeDrawer();
        } else {
            // Open new module
            const registryItem = this.configRegistry[moduleId];
            if (registryItem) {
                this.activeModuleId.set(moduleId);
                this.activeConfig.set([registryItem.config]); // Component expects array
                this.activeIconPath.set(registryItem.icon);
                this.isOpen.set(true);
            } else {
                console.warn(`No config found for module: ${moduleId}`);
                // Optionally open empty or do nothing
            }
        }
    }

    closeDrawer() {
        this.isOpen.set(false);
        this.activeModuleId.set(null);
    }
}
