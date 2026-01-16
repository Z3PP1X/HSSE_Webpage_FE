export interface ContactPerson {
  name?: string;
  email?: string;
  phoneNumber?: string;
  contactType?: number;
  sourceCategory: string;
  index: number;
}

export interface HospitalInfo {
  name?: string;
  street?: string;
  zipcode?: string;
  phoneNumber?: string;
}

export interface BranchMeta {
  sys_id?: string;
  CostCenter?: string;
  BranchName?: string;
  [k: string]: any;
}

export interface RawAlarmplanFormData {
  Branch?: {
    alarmplan_Active?: boolean;
    alarmplan_RelatedBranch?: string;          // selected value (id / sys_id / costCenter)
    alarmplan_RelatedBranch_meta?: BranchMeta; // hidden meta control
  };
  Sammelplatz?: {
    Sammelplatz_Sammelplatz?: string;
  };
  Ersthelfer?: Record<string, any>;            // dynamic flat keys (Ersthelfer_Name_1, ...)
  Brandschutzhelfer?: Record<string, any>;
  'Nächstes Krankenhaus'?: {
    'Nächstes Krankenhaus_Name des Krankenhauses'?: string;
    'Nächstes Krankenhaus_Straße und Hausnummer'?: string;
    'Nächstes Krankenhaus_Postleitzahl'?: string;
    'Nächstes Krankenhaus_Telefonnummer'?: number;
  };
  [category: string]: any;
}

export interface ImportantContacts {
  poisonEmergencyCall?: string;
  branchManager?: { name?: string; email?: string };
  management1?: { name?: string; email?: string };
  management2?: { name?: string; email?: string };
}

export interface NormalizedAlarmplanData {
  branchActive?: boolean;
  branchMeta?: BranchMeta | null;
  assemblyPoint?: string;
  firstAiders: ContactPerson[];
  fireAssistants: ContactPerson[];
  hospital?: HospitalInfo;
  allContacts: ContactPerson[];
  important?: ImportantContacts; // NEU
}
