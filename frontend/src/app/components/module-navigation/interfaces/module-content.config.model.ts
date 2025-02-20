export interface ModuleConfigurationItem {

  title: string;
  subtitle?: string;
  endpoint: string;
  order: number;
  enabled: boolean;
  expandItemsOnInit: boolean;
  allowedActions: readonly ('GET' | 'PUT' | 'POST' | 'DELETE')[];
  items: ModuleItems[];


}

interface ModuleItems{

  title: string;
  subtitle?: string;
  endpoint: string;
  allowedActions: readonly ('GET' | 'PUT' | 'POST' | 'DELETE')[];
  component: any;

}
