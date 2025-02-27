import { QuestionBase } from "../../../components/DynamicForm/question-base";
import { TextboxQuestion } from "../../../components/DynamicForm/questions/textbox";

export const AlarmplanConfig = {
  questions: [
    new TextboxQuestion({
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
      ajaxConfig: {
        endpoint: '/api/kostenstelle',
        method: 'GET',
        triggerEvents: ['init', 'change'],
        paramMap: { query: 'kostenstelle' },
        debounceTime: 300,
        onSuccess: ({ response, form, question, value }) => {
          console.log('Kostenstelle fetch success:', response);
        },
        onError: (error) => {
          console.error('Kostenstelle fetch error:', error);
        }
      }
    }),
    new TextboxQuestion({
      key: 'ersthelferName',
      label: 'Name des Ersthelfers',
      required: true,
      order: 1,
      controlType: 'textbox',
      type: 'text',
      fetchOptions: false,
      apiEndpoint: '',
      options: [],
      value: ''
    }),
    new TextboxQuestion({
      key: 'ersthelferTelefon',
      label: 'Telefonnummer des Ersthelfers',
      required: true,
      order: 2,
      controlType: 'textbox',
      type: 'text',
      fetchOptions: false,
      apiEndpoint: '',
      options: [],
      value: ''
    }),
    new TextboxQuestion({
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
    }),
    new TextboxQuestion({
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
    }),
    new TextboxQuestion({
      key: 'krankenhausAdresse',
      label: 'Adresse des nächsten Krankenhauses',
      required: true,
      order: 5,
      controlType: 'textbox',
      type: 'text',
      fetchOptions: false,
      apiEndpoint: '',
      options: [],
      value: ''
    }),
    new TextboxQuestion({
      key: 'branchManagerKontaktdaten',
      label: 'Kontaktdaten des Branch Managers',
      required: true,
      order: 6,
      controlType: 'textbox',
      type: 'text',
      fetchOptions: false,
      apiEndpoint: '',
      options: [],
      value: ''
    }),
    new TextboxQuestion({
      key: 'geschaeftsleitungKontaktdaten',
      label: 'Kontaktdaten der Geschäftsleitung',
      required: true,
      order: 7,
      controlType: 'textbox',
      type: 'text',
      fetchOptions: false,
      apiEndpoint: '',
      options: [],
      value: ''
    }),
    new TextboxQuestion({
      key: 'umweltschutzBeauftragteKontaktdaten',
      label: 'Kontaktdaten der Beauftragten für Umweltschutz',
      required: true,
      order: 8,
      controlType: 'textbox',
      type: 'text',
      fetchOptions: false,
      apiEndpoint: '',
      options: [],
      value: ''
    }),
    new TextboxQuestion({
      key: 'arbeitssicherheitsfachkraftKontaktdaten',
      label: 'Kontaktdaten der Arbeitssicherheitsfachkraft',
      required: true,
      order: 9,
      controlType: 'textbox',
      type: 'text',
      fetchOptions: false,
      apiEndpoint: '',
      options: [],
      value: ''
    })
  ]
};