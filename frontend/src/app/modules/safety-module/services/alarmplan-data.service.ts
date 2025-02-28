import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { AlarmplanFields, FirstAider, AddedContact } from "../components/alarmplan/alarmplan.model.interface";

@Injectable({
  providedIn: 'root'
})
export class AlarmplanDataService {
    private formDataSubject = new BehaviorSubject<AlarmplanFields>({} as AlarmplanFields);
    public formData$ = this.formDataSubject.asObservable();

    updateFormData(data: any) {
        // Parse form data and map to the interface structure
        const mappedData: AlarmplanFields = {
            id: 1, // Generate or get from somewhere if needed
            costCenter: Number(data.kostenstelle) || 0,
            
            // Convert contact data to FirstAider array - assuming ersthelferName contains name/phoneNumber
            firstAiderDict: Array.isArray(data.ersthelferName) ? 
                data.ersthelferName.map((item: any, index: number) => ({
                    id: index + 1,
                    name: item.name || '',
                    phoneNumber: item.number || ''
                })) : [],
                
            assemblyPoint: data.sammelplatz,
            poisonEmergencyCall: data.giftnotrufNummer,
            
            nextHospital: {
                name: data['Name des Krankenhauses'] || '',
                zipcode: data['ZIP Code'] || '',
                city: data.City || '',
                street: data.Street || '',
                houseNumber: data['House Number'] || ''
            },
            
            // Map contact data to appropriate format
            addedContact: [
                this.createContact(1, data.branchManagerKontaktdaten, "BranchManager"),
                this.createContact(2, data.geschaeftsleitungKontaktdaten, "Management"),
                this.createContact(3, data.umweltschutzBeauftragteKontaktdaten, "EnvironmentalAdvisor"),
                this.createContact(4, data.arbeitssicherheitsfachkraftKontaktdaten, "SafetyAdvisor")
            ].filter(contact => contact.name) // Filter out empty contacts
        };
        
        // Update the subject with the mapped data
        this.formDataSubject.next(mappedData);
    }
    
    // Helper method to create contact objects with proper format
    private createContact(id: number, contactData: any, contactClass: AddedContact['contactClass']): AddedContact {
        if (!contactData) return { id, name: '', phoneNumber: '', contactClass };
        
        // If contactData is already an object with name/number properties
        if (typeof contactData === 'object' && contactData !== null) {
            return {
                id,
                name: contactData.name || '',
                phoneNumber: contactData.number || '',
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
}