import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import {
  RawAlarmplanFormData,
  NormalizedAlarmplanData,
  ContactPerson,
  HospitalInfo
} from './form-data.interface';
import { AlarmplanFields, FirstAider, NextHospital, AddedContact  } from '../../modules/safety-module/components/alarmplan/alarmplan.model.interface'; // adjust import

@Injectable({ providedIn: 'root' })
export class FormDataService {
  private raw$ = new BehaviorSubject<RawAlarmplanFormData | null>(null);

  // Public raw data observable
  rawData$: Observable<RawAlarmplanFormData | null> = this.raw$.asObservable();

  // Derived / normalized data
  normalized$: Observable<NormalizedAlarmplanData> = this.rawData$.pipe(
    map(raw => this.normalize(raw))
  );

  // New: transformed Alarmplan model observable
  alarmplan$: Observable<AlarmplanFields> = this.normalized$.pipe(
    map(n => this.toAlarmplanFields(n))
  );

  setFormData(formValue: any) {
    this.raw$.next(formValue as RawAlarmplanFormData);
  }

  // Public snapshot helpers
  getAlarmplanSnapshot(): AlarmplanFields {
    return this.toAlarmplanFields(this.normalize(this.raw$.value));
  }

  private normalize(raw: RawAlarmplanFormData | null): NormalizedAlarmplanData {
    if (!raw) {
      return {
        branchActive: false,
        branchMeta: null,
        assemblyPoint: '',
        firstAiders: [],
        fireAssistants: [],
        hospital: undefined,
        allContacts: []
      };
    }

    const branchActive = raw.Branch?.alarmplan_Active ?? false;
    const branchMeta = raw.Branch?.alarmplan_RelatedBranch_meta ?? null;
    const assemblyPoint = raw.Sammelplatz?.Sammelplatz_Sammelplatz ?? '';

    const firstAiders = this.extractIndexedContacts('Ersthelfer', raw.Ersthelfer);
    const fireAssistants = this.extractIndexedContacts('Brandschutzhelfer', raw.Brandschutzhelfer);

    const hospital: HospitalInfo | undefined = raw['Nächstes Krankenhaus']
      ? {
          name: raw['Nächstes Krankenhaus']['Nächstes Krankenhaus_Name des Krankenhauses'],
          street: raw['Nächstes Krankenhaus']['Nächstes Krankenhaus_Straße und Hausnummer'],
            // Accept string or number for PLZ; convert to string
          zipcode: raw['Nächstes Krankenhaus']['Nächstes Krankenhaus_Postleitzahl']?.toString(),
          phoneNumber: raw['Nächstes Krankenhaus']['Nächstes Krankenhaus_Telefonnummer']?.toString()
        }
      : undefined;

    const allContacts = [...firstAiders, ...fireAssistants];

    return {
      branchActive,
      branchMeta,
      assemblyPoint,
      firstAiders,
      fireAssistants,
      hospital,
      allContacts
    };
  }

  private extractIndexedContacts(categoryLabel: string, group: Record<string, any> | undefined): ContactPerson[] {
    if (!group) return [];
    // Expect keys like Category_Name_1, Category_Email_1, Category_Telefonnummer_1, Category_Kontakttyp_1
    const regex = new RegExp(`^${categoryLabel}_(Name|Email|Telefonnummer|Kontakttyp)_(\\d+)$`);
    const bucket: Record<number, Partial<ContactPerson>> = {};

    Object.entries(group).forEach(([key, value]) => {
      const match = key.match(regex);
      if (!match) return;
      const field = match[1];
      const idx = parseInt(match[2], 10);
      if (!bucket[idx]) {
        bucket[idx] = { sourceCategory: categoryLabel, index: idx };
      }
      switch (field) {
        case 'Name':
          bucket[idx].name = value;
          break;
        case 'Email':
          bucket[idx].email = value;
          break;
        case 'Telefonnummer':
          bucket[idx].phoneNumber = value?.toString();
          break;
        case 'Kontakttyp':
          bucket[idx].contactType = value != null ? Number(value) : undefined;
          break;
      }
    });

    return Object.values(bucket)
      .map(c => c as ContactPerson)
      .filter(c => c.name || c.email || c.phoneNumber);
  }

  // Convenience selectors
  firstAiders$(): Observable<ContactPerson[]> {
    return this.normalized$.pipe(map(n => n.firstAiders));
  }

  fireAssistants$(): Observable<ContactPerson[]> {
    return this.normalized$.pipe(map(n => n.fireAssistants));
  }

  hospital$(): Observable<HospitalInfo | undefined> {
    return this.normalized$.pipe(map(n => n.hospital));
  }

  branchMeta$(): Observable<any> {
    return this.normalized$.pipe(map(n => n.branchMeta));
  }

  // ---- Transformer to target model ----
  private toAlarmplanFields(n: NormalizedAlarmplanData): AlarmplanFields {
    const costCenter = n.branchMeta?.CostCenter || '';
    const firstAiderDict: FirstAider[] = n.firstAiders.map(f => ({
      name: f.name || '',
      phoneNumber: f.phoneNumber || ''
    })).filter(f => f.name || f.phoneNumber);

    const assemblyPoint = n.assemblyPoint || '';

    const nextHospital: NextHospital | undefined = n.hospital
      ? this.mapHospital(n.hospital)
      : undefined;

    const addedContact: AddedContact[] = []; // extend mapping later if needed

    const alarmplan: AlarmplanFields = {
      costCenter,
      firstAiderDict,
      assemblyPoint,
      poisonEmergencyCall: undefined, // map later if available
      nextHospital,
      addedContact
    };
    return alarmplan;
  }

  private mapHospital(h: HospitalInfo): NextHospital {
    // Attempt to split street + house number (e.g. "Musterstraße 12A")
    let streetRaw = h.street || '';
    let street = streetRaw;
    let houseNumber = '';
    const match = streetRaw.match(/^(.+?)\s+(\d[\dA-Za-z\-\/]*)$/);
    if (match) {
      street = match[1];
      houseNumber = match[2];
    }
    return {
      name: h.name || '',
      street,
      houseNumber,
      zipcode: h.zipcode || '',
      city: '' // not captured in current form; extend when available
    };
  }
}