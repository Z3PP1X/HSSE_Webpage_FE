import { FormGroup } from "@angular/forms";
import { QuestionBase } from "../../../components/DynamicForm/question-base";


export const AlarmplanConfig = {
  categories:["Test", "Test2", "Test3", "Test4"],
  questions: [
    {
      key: 'kostenstelle',
      label: 'Was ist ihre Kostenstelle?',
      required: true,
      order: 0,
      controlType: 'textbox',
      type: 'text',
      fetchOptions: false,
      apiEndpoint: '',
      options: [],
      value: '',
      category: "Test",
      ajaxConfig: {
        endpoint: '/api/kostenstelle',
        method: 'GET',
        triggerEvents: ['init', 'change'],
        paramMap: { query: 'kostenstelle' },
        debounceTime: 300,
        onSuccess: ({ response, form, question, value }: { response: any; form: FormGroup; question: QuestionBase<any>; value: any }) => {
          console.log('Kostenstelle fetch success:', response);
        },
        onError: (error: any) => {
          console.error('Kostenstelle fetch error:', error);
        }
      }
    },
    {
      key: 'ersthelferName',
      label: 'Name des Ersthelfers',
      required: true,
      order: 1,
      controlType: 'contactdata',
      type: 'text',
      fetchOptions: false,
      apiEndpoint: '',
      options: [],
      value: '',
      maxContacts: 5,
    },
    
    {
      key: 'sammelplatz',
      label: 'Wo befindet sich der Sammelplatz?',
      required: true,
      order: 3,
      controlType: 'textbox',
      type: 'text',
      fetchOptions: false,
      apiEndpoint: '',
      options: [],
      value: ''
    },
    {
      key: 'giftnotrufNummer',
      label: 'Nummer des Giftnotrufs',
      required: true,
      order: 4,
      controlType: 'textbox',
      type: 'text',
      fetchOptions: false,
      apiEndpoint: '',
      options: [],
      value: ''
    },
    {
      key: 'krankenhausAdresse',
      label: 'Adresse des nächsten Krankenhauses',
      required: true,
      order: 5,
      controlType: 'adressdata',
      type: 'text',
      fetchOptions: false,
      apiEndpoint: '',
      options: [],
      value: ''
    },
    {
      key: 'branchManagerKontaktdaten',
      label: 'Kontaktdaten des Branch Managers',
      required: true,
      order: 6,
      controlType: 'contactdata',
      type: 'text',
      fetchOptions: false,
      apiEndpoint: '',
      options: [],
      value: ''
    },
    {
      key: 'geschaeftsleitungKontaktdaten',
      label: 'Kontaktdaten der Geschäftsleitung',
      required: true,
      order: 7,
      controlType: 'contactdata',
      type: 'text',
      fetchOptions: false,
      apiEndpoint: '',
      options: [],
      value: ''
    },
    {
      key: 'umweltschutzBeauftragteKontaktdaten',
      label: 'Kontaktdaten der Beauftragten für Umweltschutz',
      required: true,
      order: 8,
      controlType: 'contactdata',
      type: 'text',
      fetchOptions: false,
      apiEndpoint: '',
      options: [],
      value: ''
    },
    {
      key: 'arbeitssicherheitsfachkraftKontaktdaten',
      label: 'Kontaktdaten der Arbeitssicherheitsfachkraft',
      required: true,
      order: 9,
      controlType: 'contactdata',
      type: 'text',
      fetchOptions: false,
      apiEndpoint: '',
      options: [],
      value: ''
    }
  ]
};