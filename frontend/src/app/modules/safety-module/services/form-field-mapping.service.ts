import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { AlarmplanFields, FirstAider, AddedContact, NextHospital } from "../components/alarmplan/alarmplan.model.interface";

@Injectable({
  providedIn: 'root'
})
export class AlarmplanDataService {
    private formDataSubject = new BehaviorSubject<AlarmplanFields>({} as AlarmplanFields);
    public formData$ = this.formDataSubject.asObservable();

    updateFormData(data: any) {
        console.log('Raw form data received:', data);
        
        const mappedData: AlarmplanFields = {
            id: this.generateId(),
            
            // Map API field names to alarmplan structure
            costCenter: data.alarmplan_RelatedBranch || data.kostenstelle || '',
            assemblyPoint: data.sammelplatz || 'Not specified',
            poisonEmergencyCall: data.giftnotrufNummer || '19240',
            
            // Dynamic contact processing
            firstAiderDict: this.extractFirstAiders(data),
            addedContact: this.extractAllContacts(data),
            nextHospital: this.extractHospitalData(data)
        };
        
        console.log('Mapped alarmplan data:', mappedData);
        this.formDataSubject.next(mappedData);
    }
    
    private extractFirstAiders(data: any): FirstAider[] {
        const firstAiders: FirstAider[] = [];
        let contactIndex = 1;
        
        // Look for contact person entries marked as first aiders
        Object.keys(data).forEach(key => {
            if (key.startsWith('contactperson_ContactPersonName')) {
                const name = data[key];
                const phoneKey = key.replace('ContactPersonName', 'ContactPersonPhoneNumber');
                const typeKey = key.replace('ContactPersonName', 'ContactType');
                
                // Check if this contact is a first aider (type 1 = Emergency)
                if (data[typeKey] === 1 && name) {
                    firstAiders.push({
                        id: contactIndex++,
                        name: name,
                        phoneNumber: data[phoneKey] || ''
                    });
                }
            }
        });
        
        // Also check for direct first aider fields (fallback)
        if (data.ersthelferName) {
            if (Array.isArray(data.ersthelferName)) {
                data.ersthelferName.forEach((item: any, index: number) => {
                    if (item && (item.name || typeof item === 'string')) {
                        firstAiders.push({
                            id: contactIndex++,
                            name: item.name || item,
                            phoneNumber: item.phoneNumber || item.number || ''
                        });
                    }
                });
            } else if (typeof data.ersthelferName === 'string') {
                firstAiders.push({
                    id: contactIndex++,
                    name: data.ersthelferName,
                    phoneNumber: ''
                });
            }
        }
        
        return firstAiders;
    }

    private extractAllContacts(data: any): AddedContact[] {
        const contacts: AddedContact[] = [];
        let contactIndex = 1;

        // Extract contact persons from form fields
        Object.keys(data).forEach(key => {
            if (key.startsWith('contactperson_ContactPersonName')) {
                const name = data[key];
                const phoneKey = key.replace('ContactPersonName', 'ContactPersonPhoneNumber');
                const emailKey = key.replace('ContactPersonName', 'ContactPersonEmail');
                const typeKey = key.replace('ContactPersonName', 'ContactType');

                if (name) {
                    const contactTypeValue = data[typeKey];
                    const contactClass = this.mapContactTypeToClass(contactTypeValue);

                    contacts.push({
                        id: contactIndex++,
                        name: name,
                        phoneNumber: data[phoneKey] || '',
                        contactClass: contactClass
                    });
                }
            }
        });

        // Fallback: Check for legacy contact fields
        const legacyContacts = [
            { key: 'branchManagerKontaktdaten', class: 'BranchManager' as const },
            { key: 'geschaeftsleitungKontaktdaten', class: 'Management' as const },
            { key: 'umweltschutzBeauftragteKontaktdaten', class: 'EnvironmentalAdvisor' as const },
            { key: 'arbeitssicherheitsfachkraftKontaktdaten', class: 'SafetyAdvisor' as const }
        ];

        legacyContacts.forEach(({ key, class: contactClass }) => {
            if (data[key]) {
                const contact = this.createContact(contactIndex++, data[key], contactClass);
                if (contact.name) {
                    contacts.push(contact);
                }
            }
        });

        return contacts;
    }

    private extractHospitalData(data: any): NextHospital {
        return {
            name: data['Name des Krankenhauses'] || 
                  data.hospitalName || 
                  'Nearest Hospital',
            zipcode: data['ZIP Code'] || 
                     data.hospitalZip || 
                     '',
            city: data.City || 
                  data.hospitalCity || 
                  '',
            street: data.Street || 
                    data.hospitalStreet || 
                    '',
            houseNumber: data['House Number'] || 
                         data.hospitalNumber || 
                         ''
        };
    }

    /**
     * Map API contact type numbers to contact class strings
     */
    private mapContactTypeToClass(contactTypeValue: number): AddedContact['contactClass'] {
        const mapping: { [key: number]: AddedContact['contactClass'] } = {
            1: 'BranchManager',      // Emergency
            2: 'Management',         // Non-Emergency  
            3: 'SafetyAdvisor',      // Internal
            4: 'EnvironmentalAdvisor' // External
        };
        
        return mapping[contactTypeValue] || 'BranchManager';
    }

    /**
     * Helper method to create contact objects with proper format
     */
    private createContact(id: number, contactData: any, contactClass: AddedContact['contactClass']): AddedContact {
        if (!contactData) {
            return { 
                id, 
                name: '', 
                phoneNumber: '', 
                contactClass 
            };
        }
        
        // If contactData is already an object with name/number properties
        if (typeof contactData === 'object' && contactData !== null) {
            return {
                id,
                name: contactData.name || '',
                phoneNumber: contactData.number || contactData.phoneNumber || '',
                contactClass
            };
        }
        
        // If contactData is a string (assuming name only)
        return {
            id,
            name: String(contactData),
            phoneNumber: '',
            contactClass
        };
    }

    /**
     * Generate a unique ID for the alarmplan
     */
    private generateId(): number {
        return Date.now();
    }

    /**
     * Get current form data
     */
    getCurrentFormData(): AlarmplanFields {
        return this.formDataSubject.value;
    }

    /**
     * Reset form data
     */
    resetFormData(): void {
        this.formDataSubject.next({} as AlarmplanFields);
    }

    /**
     * Update specific field in form data
     */
    updateField(fieldName: keyof AlarmplanFields, value: any): void {
        const currentData = this.formDataSubject.value;
        const updatedData = { ...currentData, [fieldName]: value };
        this.formDataSubject.next(updatedData);
    }
}