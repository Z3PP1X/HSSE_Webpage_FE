export const ALARMPLANFIELDS = {
    id: 1,
    firstAiderDict: [
        { id: 101, name: "Max Mustermann", phoneNumber: "01234-567890" },
        { id: 102, name: "Erika Musterfrau", phoneNumber: "09876-543210" }
    ],
    assemblyPoint: "Haupteingang",
    poisonEmergencyCall: "112",
    nextHospital: {
        id: 201,
        name: "Städtisches Klinikum",
        adress: "Krankenhausstraße 1, Musterstadt",
        zipcode: "12345"
    },
    addedContact: [
        { id: 301, name: "Hans Leiter", phoneNumber: "0151-2345678", contactClass: "BranchManager" },
        { id: 302, name: "Sabine Geschäftsführung", phoneNumber: "0151-8765432", contactClass: "Management" },
        { id: 303, name: "Lukas Umweltberater", phoneNumber: "0176-9876543", contactClass: "EnvironmentalAdvisor" },
        { id: 304, name: "Petra Sicherheitsberaterin", phoneNumber: "0176-4567890", contactClass: "SafetyAdvisor" },
        { id: 305, name: "Claudia Qualitätsmanagement", phoneNumber: "0176-1234567", contactClass: "QualityManagement" },
        { id: 306, name: "Dr. Martin Betriebsarzt", phoneNumber: "0176-7654321", contactClass: "CompanyDoctor" }
    ]
};
