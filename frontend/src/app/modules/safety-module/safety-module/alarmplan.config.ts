import { QuestionBase } from "../../../components/DynamicForm/question-base";

export const AlarmplanConfig = {
  questions: [
    new QuestionBase({
      key: 'location',
      label: 'Location',
      required: true,
      order: 1,
      controlType: 'textbox',
      type: 'text',
      fetchOptions: false,
      apiEndpoint: '',
      options: [],
      value: '',
      ajaxConfig: {
        endpoint: '/api/locations',
        method: 'GET',
        triggerEvents: ['init', 'change'],
        paramMap: { query: 'location' },
        debounceTime: 300,
        onSuccess: ({ response, form, question, value }) => {
          console.log('Location fetch success:', response);
        },
        onError: (error) => {
          console.error('Location fetch error:', error);
        }
      }
    }),
    new QuestionBase({
      key: 'alarmCode',
      label: 'Alarm Code',
      required: true,
      order: 2,
      controlType: 'textbox',
      type: 'text',
      fetchOptions: false,
      apiEndpoint: '',
      options: [],
      value: '',
      ajaxConfig: {
        endpoint: '/api/validate-code',
        method: 'POST',
        triggerEvents: ['change'],
        paramMap: { code: 'alarmCode' },
        onSuccess: ({ response, form, question, value }) => {
          console.log('Code validation success:', response);
        },
        onError: (error) => {
          console.error('Code validation error:', error);
        }
      }
    })
  ]
};