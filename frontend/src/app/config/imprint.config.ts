// frontend/src/app/config/imprint.config.ts
export interface ContactInfo {
    email: string;
    phone: string;
    fax?: string;
    department?: string;
  }
  
  export interface Address {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    building?: string;
    floor?: string;
  }
  
  export interface CompanyInfo {
    name: string;
    legalName: string;
    registrationNumber: string;
    vatNumber: string;
    website: string;
    founded: string;
    ceo: string;
    headquarters: Address;
    offices: { name: string; address: Address; contacts: ContactInfo[] }[];
  }
  
  export interface SupportInfo {
    helpdesk: ContactInfo;
    technicalSupport: ContactInfo;
    emergencyContact: ContactInfo;
    businessHours: {
      monday: string;
      tuesday: string;
      wednesday: string;
      thursday: string;
      friday: string;
      saturday: string;
      sunday: string;
    };
    responseTime: {
      critical: string;
      high: string;
      medium: string;
      low: string;
    };
  }
  
  export interface ImprintConfig {
    company: CompanyInfo;
    support: SupportInfo;
    legal: {
      privacyPolicyUrl: string;
      termsOfServiceUrl: string;
      cookiePolicyUrl: string;
      dataProtectionOfficer: ContactInfo;
    };
    social: {
      linkedin?: string;
      twitter?: string;
      youtube?: string;
      facebook?: string;
    };
    lastUpdated: string;
  }
  
  export const IMPRINT_CONFIG: ImprintConfig = {
    company: {
      name: "SIXT",
      legalName: "Sixt SE",
      registrationNumber: "HRB 206738",
      vatNumber: "DE 815 000 722",
      website: "https://www.sixt.com",
      founded: "1912",
      ceo: "Alexander Sixt, Konstantin Sixt",
      headquarters: {
        street: "Zugspitzstraße 1",
        city: "Pullach",
        postalCode: "82049",
        country: "Germany"
      },
      offices: [
        {
          name: "Munich Office",
          address: {
            street: "Zugspitzstraße 1",
            city: "München",
            postalCode: "80337",
            country: "Germany",
            building: "Building A",
            floor: "3rd Floor"
          },
          contacts: [
            {
              email: "munich.office@sixt.com",
              phone: "+49 89 7444 4444",
              department: "HSSE Department"
            }
          ]
        },
        {
          name: "Berlin Office",
          address: {
            street: "Unter den Linden 1",
            city: "Berlin",
            postalCode: "10117",
            country: "Germany"
          },
          contacts: [
            {
              email: "berlin.office@sixt.com",
              phone: "+49 30 1234 5678",
              department: "Operations"
            }
          ]
        }
      ]
    },
    support: {
      helpdesk: {
        email: "hsse.support@sixt.com",
        phone: "+49 89 7444 4400",
        department: "HSSE Helpdesk"
      },
      technicalSupport: {
        email: "tech.support@sixt.com",
        phone: "+49 89 7444 4401",
        department: "IT Support"
      },
      emergencyContact: {
        email: "emergency@sixt.com",
        phone: "+49 89 7444 4444",
        department: "Emergency Response Team"
      },
      businessHours: {
        monday: "08:00 - 18:00",
        tuesday: "08:00 - 18:00",
        wednesday: "08:00 - 18:00",
        thursday: "08:00 - 18:00",
        friday: "08:00 - 17:00",
        saturday: "Closed",
        sunday: "Closed"
      },
      responseTime: {
        critical: "Within 1 hour",
        high: "Within 4 hours",
        medium: "Within 24 hours",
        low: "Within 72 hours"
      }
    },
    legal: {
      privacyPolicyUrl: "/privacy-policy",
      termsOfServiceUrl: "/terms-of-service",
      cookiePolicyUrl: "/cookie-policy",
      dataProtectionOfficer: {
        email: "dpo@sixt.com",
        phone: "+49 89 7444 4402",
        department: "Data Protection Office"
      }
    },
    social: {
      linkedin: "https://www.linkedin.com/company/sixt",
      twitter: "https://twitter.com/sixt",
      youtube: "https://www.youtube.com/user/sixt",
      facebook: "https://www.facebook.com/sixt"
    },
    lastUpdated: "2025-01-09"
  };