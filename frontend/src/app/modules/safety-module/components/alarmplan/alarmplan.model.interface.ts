import { ContentChildDecorator } from "@angular/core"

export interface AlarmplanFields{

    id: number
    firstAiderDict: FirstAider[]
    assemblyPoint?: string
    poisonEmergencyCall?: string
    nextHospital?: NextHospital
    addedContact?: AddedContact[]

}

interface FirstAider{

    id: number
    name: string
    phoneNumber: string


}

interface NextHospital{

    id: number
    name: string
    adress: string
    zipcode: string
}

interface AddedContact{

    id: number
    name: string
    phoneNumber: string
    contactClass: "BranchManager" | "Management" | "EnvironmentalAdvisor" | "SafetyAdvisor" | "QualityManagement" | "CompanyDoctor"

}