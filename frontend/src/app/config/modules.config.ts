export enum ModuleStatus {
    DISABLED = 'disabled',
    DEVELOPMENT = 'development', 
    STAGING = 'staging',
    PRODUCTION = 'production'
  }
  
  export interface GlobalModuleConfig {
    id: string;
    name: string;
    status: ModuleStatus;
    iconPath: string;
    route: string;
    tooltip: string;
    order: number;
    requiresAuth?: boolean;
    permissions?: string[];
    component?: any;
  }
  
  export const GLOBAL_MODULES_CONFIG: GlobalModuleConfig[] = [
    {
      id: 'safety-module',
      name: 'Safety Module',
      status: ModuleStatus.PRODUCTION, // Ready for production
      iconPath: 'ehs-icons/safety-white.svg',
      route: 'safety',
      tooltip: 'Safety Management',
      order: 100,
      requiresAuth: false
    },
    {
      id: 'health-module', 
      name: 'Health Module',
      status: ModuleStatus.DISABLED, // In staging
      iconPath: 'ehs-icons/health-white.svg',
      route: 'health',
      tooltip: 'Health Management', 
      order: 200,
      requiresAuth: false
    },
    {
      id: 'account-module',
      name: 'Account Module', 
      status: ModuleStatus.DISABLED, // Still in development
      iconPath: 'ehs-icons/person-white.svg',
      route: 'account',
      tooltip: 'Account Management',
      order: 300,
      requiresAuth: true
    },
    {
      id: 'reporting-module',
      name: 'Reporting Module',
      status: ModuleStatus.DISABLED, // Not ready yet
      iconPath: 'ehs-icons/report-white.svg', 
      route: 'reporting',
      tooltip: 'Reporting & Analytics',
      order: 400,
      requiresAuth: true
    },
    {
      id: 'emergency-contacts',
      name: 'Emergency Contacts',
      status: ModuleStatus.DISABLED,
      iconPath: 'ehs-icons/phone.svg',
      route: 'emergency-contacts', 
      tooltip: 'Emergency Contacts',
      order: 500,
      requiresAuth: false
    }
  ];