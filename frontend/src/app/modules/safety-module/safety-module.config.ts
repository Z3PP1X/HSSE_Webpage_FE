export const SafetyModuleConfig = {
  
  moduleTitle: 'Safety Module',
  
  menus: [
    {
      menuId: 'alarmplan',
      title: 'Alarmplan',
      navigation: [
        { title: 'Create Alarmplan', route: '/safety/alarmplan/create', icon: 'create' },
        { title: 'View Alarmplans', route: '/safety/alarmplan/view', icon: 'list' }
      ],
      forms: [
        { name: 'Digitaler Alarmplan', path: 'forms/alarmplan' }
      ]
    },
    {
      menuId: 'hazardous',
      title: 'Gefahrstoffverzeichnis',
      navigation: [
        { title: 'Add Substances', route: '/safety/hazardous/add', icon: 'add' },
        { title: 'View Registry', route: '/safety/hazardous/view', icon: 'view' }
      ],
      forms: [
        { name: 'Gefahrstoffdaten', path: 'forms/hazardous-materials' },
        { name: 'Sicherheitsdatenblatt', path: 'forms/safety-data-sheet' }
      ]
    },
    {
      menuId: 'test',
      title: 'Test',
      navigation: [
        { title: 'Test Form', route: '/safety/test/run', icon: 'test' }
      ],
      forms: [
        { name: 'Testformular', path: 'forms/test-form' }
      ]
    }
  ],

  defaultMenu: 'alarmplan'
};

// Keep this for backward compatibility if needed
export const AlarmplanApiEndpoint = 'forms/alarmplan';