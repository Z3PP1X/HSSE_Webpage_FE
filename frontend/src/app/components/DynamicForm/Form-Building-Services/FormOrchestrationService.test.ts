import { TestBed } from '@angular/core/testing';
import { FormGroup, FormControl } from '@angular/forms';
import { of, throwError, firstValueFrom } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { FormOrchestrationService } from './FormOrchestrationService';
import { FormModelService } from './FormModelService';
import { ApiService } from '../../../global-services/api-service/api-service';
import { QuestionBase } from '../question-base';
import { FormGroupBase } from '../Form/form/form-group-base';

const mockApiResponse = {
    form_id: "alarmplan_form",
    form_title: "Emergency Alarm Plan",
    shared_configs: {
        ajax_configs: {
            alarmplan_RelatedBranch_ajax: {
                endpoint: "/api/branchnetwork/costcenters/",
                method: "GET",
                triggerEvents: [ "input", "focus" ],
                debounceTime: 300
            }
        }
    },
    structure: [
        {
            key: "Branch",
            title: "Branch",
            isCategory: true,
            expandable: false,
            fields: [
                {
                    key: "alarmplan_Active",
                    label: "Alarmplan - Active",
                    required: true,
                    field_type: "checkbox",
                    model: "Alarmplan"
                },
                {
                    key: "alarmplan_RelatedBranch",
                    label: "Alarmplan - RelatedBranch",
                        required: true,
                    field_type: "ajax_select",
                    model: "Alarmplan",
                    ajax_config: "alarmplan_RelatedBranch_ajax",
                    search_field: "CostCenter",
                    display_field: "BranchName",
                    value_field: "sys_id"
                }
            ]
        }
    ]
};

class MockApiService {
    get = jasmine.createSpy('get').and.returnValue(of(mockApiResponse));
    buildParams = jasmine.createSpy('buildParams').and.returnValue(new HttpParams());
    getEnvironmentInfo() { return { apiBaseUrl: 'http://localhost:8000/api' }; }
    healthCheck = jasmine.createSpy('healthCheck').and.returnValue(of({ ok: true }));
}

class MockFormModelService {
    processFormStructure = jasmine.createSpy('processFormStructure');
    emitCurrentFormStructure = jasmine.createSpy('emitCurrentFormStructure');
    getFormStructure = jasmine.createSpy('getFormStructure').and.returnValue(
        of(new FormGroup({
            Branch: new FormGroup({
                alarmplan_Active: new FormControl(false),
                alarmplan_RelatedBranch: new FormControl('')
            })
        }))
    );
}

describe('FormOrchestrationService.generateForm', () => {
    let service: FormOrchestrationService;
    let api: MockApiService;
    let model: MockFormModelService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                FormOrchestrationService,
                { provide: ApiService, useClass: MockApiService },
                { provide: FormModelService, useClass: MockFormModelService }
            ]
        });
        service = TestBed.inject(FormOrchestrationService);
        api = TestBed.inject(ApiService) as unknown as MockApiService;
        model = TestBed.inject(FormModelService) as unknown as MockFormModelService;
    });

    it('should load API, map ajax_select field and return a FormGroup', (done) => {
        service.generateForm('alarmplan/emergency-planning/form_schema/').subscribe(form => {
            expect(form instanceof FormGroup).toBeTrue();
            expect(api.get).toHaveBeenCalledWith(
                'alarmplan/emergency-planning/form_schema/',
                { params: jasmine.any(HttpParams) }
            );
            // Metadata
            service.getFormMetadata().subscribe(meta => {
                expect(meta.form_title).toBe('Emergency Alarm Plan');
            });

            // Check processed structure emitted
            service.getFormQuestions().subscribe(struct => {
                expect(struct.length).toBe(1);
                const branch = struct[0] as FormGroupBase<any>;
                expect(branch.key).toBe('Branch');
                const ajaxField = (branch.fields as any[]).find(f => f.key === 'alarmplan_RelatedBranch');
                expect(ajaxField).toBeTruthy();
                expect(ajaxField.field_type).toBe('ajax_select');
                // Sanitized endpoint (leading /api stripped)
                expect(ajaxField.endpoint).toBe('branchnetwork/costcenters/');
                expect(ajaxField.triggerEvents).toEqual(['input','focus']);
                expect(ajaxField.debounceTime).toBe(300);
            });

            // FormModelService interactions
            expect(model.processFormStructure).toHaveBeenCalled();
            expect(model.emitCurrentFormStructure).toHaveBeenCalled();
            done();
        });
    });

    it('should toggle loading state around generateForm', async () => {
        const states: boolean[] = [];
        service.isLoading().subscribe(s => states.push(s));

        await firstValueFrom(service.generateForm('alarmplan/emergency-planning/form_schema/'));
        // At least one true then final false
        expect(states).toContain(true);
        expect(states[states.length - 1]).toBeFalse();
    });

    it('should handle API error gracefully and expose error state', (done) => {
        api.get.and.returnValue(throwError(() => new Error('Network')));
        service.generateForm('bad-endpoint').subscribe({
            next: form => {
                expect(form instanceof FormGroup).toBeTrue();
                service.getError().subscribe(err => {
                    expect(err).toBe('Failed to generate form');
                    service.isLoading().subscribe(l => {
                        expect(l).toBeFalse();
                        done();
                    });
                });
            },
            error: () => {
                // Service should not propagate the throw (it wraps with throwError after logging)
                // If it does, fail
                fail('Error should have been caught and transformed.');
            }
        });
    });

    it('should not duplicate /api segment in ajax endpoint', (done) => {
        service.generateForm('alarmplan/emergency-planning/form_schema/').subscribe(() => {
            service.getFormQuestions().subscribe(struct => {
                const branch = struct[0] as FormGroupBase<any>;
                const ajaxField = (branch.fields as any[]).find(f => f.key === 'alarmplan_RelatedBranch');
                expect(ajaxField.endpoint.startsWith('api/api')).toBeFalse();
                done();
            });
        });
    });

    it('should preserve non-ajax fields untouched', (done) => {
        service.generateForm('alarmplan/emergency-planning/form_schema/').subscribe(() => {
            service.getFormQuestions().subscribe(struct => {
                const branch = struct[0] as FormGroupBase<any>;
                const checkbox = (branch.fields as any[]).find(f => f.key === 'alarmplan_Active');
                expect(checkbox).toBeTruthy();
                expect(checkbox.field_type).toBe('checkbox');
                done();
            });
        });
    });
});