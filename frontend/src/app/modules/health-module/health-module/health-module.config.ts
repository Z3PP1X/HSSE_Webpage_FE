import { HealthModuleComponent } from './health-module.component';


export const HealthModuleConfig = [
  {
    title: 'Arbeitsunfälle',
    subtitle: 'Erstellen und Verwalten von Verbandbucheinträgen',
    endpoint: '/api/verbandbucheintrag',
    order: 1,
    id: 100,
    enabled: true,
    expandItemsOnInit: true,
    allowedActions: ['GET', 'POST', 'PUT', 'DELETE'] as const,
    items: [
      {
        title: 'Eintrag erstellen',
        subtitle: 'Neuen Verbandbucheintrag anlegen',
        endpoint: '/api/verbandbucheintrag/create',
        allowedActions: ['POST'] as const,
        component: "",
      },
      {
        title: 'Eintrag bearbeiten',
        subtitle: 'Bestehenden Eintrag bearbeiten',
        endpoint: '/api/verbandbucheintrag/edit',
        allowedActions: ['PUT'] as const,
        component: "",
      },
      {
        title: 'Eintrag löschen',
        subtitle: 'Löschen eines Verbandbucheintrags',
        endpoint: '/api/verbandbucheintrag/delete',
        allowedActions: ['DELETE'] as const,
        component: "",
      },
    ],
  },
  {
    title: 'Ergonomie',
    subtitle: 'Förderung und Bereitstellung ergonomischer Arbeitsmittel',
    endpoint: '/api/ergonomisches-equipment',
    order: 2,
    id: 300,
    enabled: true,
    expandItemsOnInit: false,
    allowedActions: ['GET', 'POST'] as const,
    items: [
      {
        title: 'Ergonomische Stühle',
        subtitle: 'Verfügbarkeit und Bestellung ergonomischer Stühle',
        endpoint: '/api/ergonomisches-equipment/chairs',
        allowedActions: ['GET', 'POST'] as const,
        component: "",
      },
      {
        title: 'Ergonomische Tische',
        subtitle: 'Verfügbarkeit und Bestellung ergonomischer Tische',
        endpoint: '/api/ergonomisches-equipment/desks',
        allowedActions: ['GET', 'POST'] as const,
        component: "",
      },
      {
        title: 'Zubehör',
        subtitle: 'Bestellung von ergonomischem Zubehör',
        endpoint: '/api/ergonomisches-equipment/accessories',
        allowedActions: ['GET', 'POST'] as const,
        component: "",
      },
    ],
  },
  {
    title: 'FAQ´s',
    subtitle: 'Häufig gestellte Fragen und Antworten',
    endpoint: '/api/faqs',
    order: 3,
    id: 400,
    enabled: true,
    expandItemsOnInit: false,
    allowedActions: ['GET'] as const,
    items: [
      {
        title: 'Allgemeine Fragen',
        subtitle: 'Antworten auf allgemeine Fragen',
        endpoint: '/api/faqs/general',
        allowedActions: ['GET'] as const,
        component: "",
      },
      {
        title: 'Technische Fragen',
        subtitle: 'Antworten auf technische Fragen',
        endpoint: '/api/faqs/technical',
        allowedActions: ['GET'] as const,
        component: "",
      },
      {
        title: 'Kundensupport',
        subtitle: 'Häufig gestellte Fragen zum Kundensupport',
        endpoint: '/api/faqs/support',
        allowedActions: ['GET'] as const,
        component: "",
      },
    ],
  },
];

