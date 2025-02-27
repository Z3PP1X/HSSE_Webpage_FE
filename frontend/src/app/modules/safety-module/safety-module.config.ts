

export const SafetyModuleConfig = [
  {
    title: 'Alarmplan',
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
  
];

