export interface AlarmplanFields {
    id?: number;
    costCenter: string | number;
    companyNumber?: string;
    firstAiderDict: FirstAider[];
    assemblyPoint?: string;
    poisonEmergencyCall?: string;
    nextHospital?: NextHospital;
    addedContact?: AddedContact[];
    branchStreet?: string;
    branchCity?: string;
}

export interface FirstAider {
    id?: number;
    name: string;
    phoneNumber: string;
}

export interface NextHospital {
    name: string;
    houseNumber: string;
    zipcode: string;
    city: string;
    street: string;
}

export interface AddedContact {
    id?: number;
    name: string;
    phoneNumber?: string;
    email?: string;
    contactClass: "BranchManager" | "Management" | "EnvironmentalAdvisor" | "SafetyAdvisor" | "QualityManagement" | "CompanyDoctor";
}

export interface AddedContact {
    id?: number;
    name: string;
    phoneNumber?: string;
    contactClass: "BranchManager" | "Management" | "EnvironmentalAdvisor" | "SafetyAdvisor" | "QualityManagement" | "CompanyDoctor";
    email?: string;
}