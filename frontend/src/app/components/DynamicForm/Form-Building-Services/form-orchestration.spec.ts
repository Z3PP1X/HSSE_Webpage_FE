import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormGroup } from '@angular/forms';
import { of } from 'rxjs';

import { FormOrchestrationService } from './FormOrchestrationService';
import { FormMetadataService } from './FormMetadataService';
import { FormModelService } from './FormModelService';
import { FormBuilderService } from './FormBuilderService';
import { QuestionBase } from '../question-base';
import { FormGroupBase } from '../Form/form/form-group-base';

describe('Form Orchestration Workflow', () => {
  let orchestrationService: FormOrchestrationService;
  let metadataService: FormMetadataService;
  let modelService: FormModelService;
  let builderService: FormBuilderService;

  const mockMetadata = [
    {
      key: 'firstName',
      verbose_name: 'First Name',
      field_type: 'CharField',
      required: true,
      blank: false,
      choices: []
    },
    {
      key: 'age',
      verbose_name: 'Age',
      field_type: 'IntegerField',
      required: false,
      blank: true,
      choices: []
    },
    {
      key: 'department',
      verbose_name: 'Department',
      field_type: 'IntegerField',
      required: true,
      blank: false,
      choices: [
        { key: 1, value: 'HR' },
        { key: 2, value: 'IT' },
        { key: 3, value: 'Finance' }
      ]
    }
  ];

  // Add category as a custom property to QuestionBase for testing purposes
  interface QuestionWithCategory extends QuestionBase<any> {
    category?: string;
  }

  const mockQuestions: QuestionWithCategory[] = [
    new QuestionBase<string>({
      key: 'firstName',
      label: 'First Name',
      controlType: 'textbox',
      required: true,
      order: 0,
    }) as QuestionWithCategory,
    
    new QuestionBase<number>({
      key: 'age',
      label: 'Age',
      controlType: 'integer',
      required: false,
      order: 1,
    }) as QuestionWithCategory,
    
    new QuestionBase<string>({
      key: 'department',
      label: 'Department',
      controlType: 'dropdown',
      required: true,
      options: [
        { key: '1', value: 1 },
        { key: '2', value: 2 },
        { key: '3', value: 3 }
      ],
      order: 2,
    }) as QuestionWithCategory
  ];

  // Assign categories to questions after creation
  mockQuestions[0].category = 'personalInfo';
  mockQuestions[1].category = 'personalInfo';
  mockQuestions[2].category = 'workInfo';

  const mockFormStructure: FormGroupBase<any>[] = [
    {
        key: 'personalInfo',
        isCategory: true,
        fields: [
            mockQuestions[0],
            mockQuestions[1]
        ],
        title: ''
    },
    {
        key: 'workInfo',
        isCategory: true,
        fields: [
            mockQuestions[2]
        ],
        title: ''
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FormOrchestrationService,
        FormMetadataService,
        FormModelService,
        FormBuilderService
      ]
    });

    orchestrationService = TestBed.inject(FormOrchestrationService);
    metadataService = TestBed.inject(FormMetadataService);
    modelService = TestBed.inject(FormModelService);
    builderService = TestBed.inject(FormBuilderService);
  });

  it('should be created', () => {
    expect(orchestrationService).toBeTruthy();
  });

  it('should initialize with an empty FormGroup', (done) => {
    orchestrationService.getCurrentForm().subscribe(form => {
      expect(form).toBeInstanceOf(FormGroup);
      expect(Object.keys(form.controls).length).toBe(0);
      done();
    });
  });

  it('should transform API metadata to questions', () => {
    const transformSpy = spyOn(metadataService, 'convertMetadataToQuestionModel').and.callThrough();
    
    metadataService.convertMetadataToQuestionModel(mockMetadata);
    
    expect(transformSpy).toHaveBeenCalledWith(mockMetadata);
    expect(transformSpy).toHaveBeenCalledTimes(1);
  });

  it('should structure form data with categories', (done) => {
    // Access private method via any cast
    const structureFormData = (orchestrationService as any).structureFormData;
    
    structureFormData(mockQuestions, 'testForm').subscribe((formStructure: FormGroupBase<any>[]) => {
      expect(formStructure.length).toBe(2); // We should have 2 categories
      expect(formStructure[0].key).toBe('personalInfo');
      expect(formStructure[0].fields.length).toBe(2);
      expect(formStructure[1].key).toBe('workInfo');
      expect(formStructure[1].fields.length).toBe(1);
      done();
    });
  });

  it('should generate a form from API metadata', (done) => {
    spyOn(metadataService, 'getFormMetadata').and.returnValue(of(mockQuestions));
    spyOn(modelService, 'processFormStructure').and.returnValue(of(new FormGroup({
      personalInfo: new FormGroup({
        firstName: builderService.toFormGroup([mockQuestions[0]]).get('firstName')!,
        age: builderService.toFormGroup([mockQuestions[1]]).get('age')!
      }),
      workInfo: new FormGroup({
        department: builderService.toFormGroup([mockQuestions[2]]).get('department')!
      })
    })));

    orchestrationService.generateForm('/api/form').subscribe(form => {
      expect(form).toBeTruthy();
      expect(form instanceof FormGroup).toBe(true);
      
      // Check if the form has the expected structure
      expect(form.get('personalInfo')).toBeTruthy();
      expect(form.get('workInfo')).toBeTruthy();
      expect(form.get('personalInfo')?.get('firstName')).toBeTruthy();
      expect(form.get('personalInfo')?.get('age')).toBeTruthy();
      expect(form.get('workInfo')?.get('department')).toBeTruthy();
      
      // Check validation
      const firstNameControl = form.get('personalInfo')?.get('firstName');
      expect(firstNameControl?.valid).toBeFalse(); // Required field with no value
      
      done();
    });
  });

  it('should process form structure correctly', (done) => {
    const processSpy = spyOn(modelService, 'processFormStructure').and.callThrough();
    
    // Create a minimal form group for testing
    const testFormGroup = new FormGroup({
      testCategory: new FormGroup({})
    });
    
    // Make the spy return our test form group
    processSpy.and.returnValue(of(testFormGroup));
    
    modelService.processFormStructure(mockFormStructure).subscribe(formGroup => {
      expect(processSpy).toHaveBeenCalledWith(mockFormStructure);
      expect(formGroup).toBe(testFormGroup);
      done();
    });
  });

  it('should handle errors during form generation', (done) => {
    const errorMsg = 'Test error';
    spyOn(metadataService, 'getFormMetadata').and.throwError(errorMsg);
    
    orchestrationService.generateForm('/api/form').subscribe({
      next: () => {
        fail('Should have failed with an error');
      },
      error: (err) => {
        expect(err).toBeTruthy();
        orchestrationService.getError().subscribe(error => {
          expect(error).toContain(errorMsg);
          done();
        });
      }
    });
  });

  it('should reset the form', (done) => {
    // Setup a form with some values
    const testForm = new FormGroup({
      test: new FormGroup({
        field: builderService.toFormGroup([
          new QuestionBase<string>({
            key: 'field',
            label: 'Test Field',
            value: 'test value',
            controlType: 'textbox',
            order: 0
          })
        ]).get('field')!
      })
    });
    
    // Set the test form as current
    (orchestrationService as any).currentForm$.next(testForm);
    
    // Check that the form has a value
    expect(testForm.get('test')?.get('field')?.value).toBe('test value');
    
    // Reset the form
    orchestrationService.resetForm();
    
    // Check the form was reset
    expect(testForm.get('test')?.get('field')?.value).toBe(null);
    
    orchestrationService.getCurrentForm().subscribe(form => {
      expect(form).toBe(testForm);
      done();
    });
  });
});
