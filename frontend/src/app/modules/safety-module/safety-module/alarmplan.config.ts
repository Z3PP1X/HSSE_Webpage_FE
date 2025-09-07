import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, catchError, of } from 'rxjs';
import { ApiService } from "../../../global-services/api-service/api-service";

// Interface for the raw API response
export interface AlarmplanApiResponse {
  form_id: string;
  form_title: string;
  shared_configs?: any;
  structure: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AlarmplanConfigService {
  private configSubject = new BehaviorSubject<AlarmplanApiResponse | null>(null);
  public config$ = this.configSubject.asObservable();

  private readonly API_ENDPOINT = 'alarmplan/emergency-planning/form_schema/';

  constructor(private apiService: ApiService) {}

  /**
   * Load alarmplan configuration from API
   * Returns the raw API response without transformation
   */
  loadConfig(): Observable<AlarmplanApiResponse> {
    const params = this.apiService.buildParams({ format: 'json' });
    
    return this.apiService.get<AlarmplanApiResponse>(this.API_ENDPOINT, { params }).pipe(
      catchError(error => {
        console.error('Failed to load alarmplan config:', error);
        // Return fallback config or empty config
        return of(this.getFallbackConfig());
      })
    );
  }

  /**
   * Get current configuration
   */
  getCurrentConfig(): AlarmplanApiResponse | null {
    return this.configSubject.value;
  }

  /**
   * Update configuration and notify subscribers
   */
  updateConfig(config: AlarmplanApiResponse): void {
    this.configSubject.next(config);
  }

  /**
   * Check if API is available and config can be loaded
   */
  checkApiAvailability(): Observable<boolean> {
    return this.apiService.healthCheck().pipe(
      catchError(() => of(false))
    );
  }

  /**
   * Fallback configuration in case API fails
   * Matches the expected API response structure
   */
  private getFallbackConfig(): AlarmplanApiResponse {
    return {
      form_id: "alarmplan_form_fallback",
      form_title: "Emergency Alarm Plan (Fallback)",
      shared_configs: {
        ajax_configs: {}
      },
      structure: [
        {
          key: "plan_setup",
          title: "Plan Configuration",
          isCategory: true,
          fields: [
            {
              key: "alarmplan_Active",
              original_key: "Active",
              label: "Active",
              help_text: "",
              required: true,
              field_type: "checkbox",
              choices: null,
              model: "Alarmplan"
            },
            {
              key: "alarmplan_RelatedBranch",
              original_key: "RelatedBranch",
              label: "Related Branch",
              help_text: "",
              required: true,
              field_type: "select",
              choices: null,
              model: "Alarmplan"
            }
          ]
        },
        {
          key: "emergency_contacts",
          title: "Emergency Contact Persons",
          isCategory: true,
          fields: [
            {
              key: "contactperson_ContactPersonName",
              original_key: "ContactPersonName",
              label: "Contact Person Name",
              help_text: "",
              required: true,
              field_type: "text",
              choices: null,
              model: "ContactPerson"
            },
            {
              key: "contactperson_ContactPersonPhoneNumber",
              original_key: "ContactPersonPhoneNumber",
              label: "Contact Person Phone",
              help_text: "",
              required: false,
              field_type: "text",
              choices: null,
              model: "ContactPerson"
            }
          ]
        }
      ]
    };
  }
}