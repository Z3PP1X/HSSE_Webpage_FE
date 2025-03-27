export interface ModuleConfigurationItem {
  
  moduleTitle: string;
  menus: ModuleMenu[];
  defaultMenu?: string;
  
  // Legacy properties (all optional for backward compatibility)
  title?: string;
  subtitle?: string;
  navigation?: NavigationItem[];
  forms?: FormDefinition[];
  endpoint?: string;
  order?: number;
  enabled?: boolean;
  expandItemsOnInit?: boolean;
  allowedActions?: readonly ('GET' | 'PUT' | 'POST' | 'DELETE')[];
  items?: ModuleItems[];
}

export interface ModuleMenu {
  menuId: string;
  title: string;
  navigation: NavigationItem[];
  forms: FormDefinition[];
}

export interface NavigationItem {
  title: string;
  route: string;
  icon?: string;
}

export interface FormDefinition {
  name: string;
  path: string;
}

export interface ModuleItems {
  title: string;
  subtitle?: string;
  endpoint: string;
  allowedActions: readonly ('GET' | 'PUT' | 'POST' | 'DELETE')[];
  component: any;
}