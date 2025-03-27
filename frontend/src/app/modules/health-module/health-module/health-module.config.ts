// Update health-module.config.ts
import { ModuleConfigurationItem } from "../../../components/module-navigation/interfaces/module-content.config.model";

export const HealthModuleConfig: ModuleConfigurationItem = {
  moduleTitle: 'Health Module',
  menus: [
    {
      menuId: 'healthForms',
      title: 'Health Forms',
      navigation: [
        { title: 'Dashboard', route: '/health/dashboard', icon: 'dashboard' },
        { title: 'Reports', route: '/health/reports', icon: 'reports' }
      ],
      forms: [
        { name: 'Unfallbericht', path: 'forms/unfallbericht' },
        { name: 'Gesundheitscheck', path: 'forms/gesundheitscheck' },
        { name: 'Risikobewertung', path: 'forms/risikobewertung' }
      ]
    }
  ],
  defaultMenu: 'healthForms'
};