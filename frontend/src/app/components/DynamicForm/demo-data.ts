import { FormConfig } from './models/form-config.model';

export const ALARM_PLAN_FORM_CONFIG: FormConfig = {
    "form_id": "alarmplan_form",
    "form_title": "Emergency Alarm Plan",
    "shared_configs": {
        "ajax_configs": {
            "alarmplan_RelatedBranch_ajax": {
                "endpoint": "/api/branchnetwork/costcenters/",
                "method": "GET",
                "triggerEvents": [
                    "input",
                    "focus"
                ],
                "debounceTime": 300
            }
        }
    },
    "structure": [
        {
            "key": "Branch",
            "title": "Branch",
            "isCategory": true,
            "expandable": false,
            "fields": [
                {
                    "key": "alarmplan_RelatedBranch",
                    "original_key": "RelatedBranch",
                    "instance_key": "alarmplan",
                    "label": "Alarmplan - RelatedBranch",
                    "help_text": "",
                    "required": false,
                    "field_type": "ajax_select",
                    "choices": null,
                    "model": "Alarmplan",
                    "ajax_config": "alarmplan_RelatedBranch_ajax",
                    "search_field": "CostCenter",
                    "display_field": "BranchName",
                    "value_field": "sys_id"
                }
            ]
        },
        {
            "key": "Sammelplatz",
            "title": "Sammelplatz",
            "isCategory": true,
            "expandable": false,
            "fields": [
                {
                    "key": "Sammelplatz_Sammelplatz",
                    "original_key": "AssemblyPoint",
                    "instance_key": "alarmplan",
                    "label": "Sammelplatz",
                    "help_text": "",
                    "required": false,
                    "field_type": "text",
                    "choices": null,
                    "model": "Alarmplan"
                }
            ]
        },
        {
            "key": "Ersthelfer",
            "title": "Ersthelfer",
            "isCategory": true,
            "expandable": true,
            "min_instances": 1,
            "max_instances": 5,
            "fields": [
                {
                    "key": "Ersthelfer_Name_{index}",
                    "original_key": "ContactPersonName",
                    "instance_key": "contactperson",
                    "label": "Name",
                    "help_text": "",
                    "required": true,
                    "field_type": "text",
                    "choices": null,
                    "model": "ContactPerson",
                    "key_template": "Ersthelfer_Name",
                    "expandable": true
                },
                {
                    "key": "Ersthelfer_Email_{index}",
                    "original_key": "ContactPersonEmail",
                    "instance_key": "contactperson",
                    "label": "Email",
                    "help_text": "",
                    "required": false,
                    "field_type": "email",
                    "choices": null,
                    "model": "ContactPerson",
                    "key_template": "Ersthelfer_Email",
                    "expandable": true
                },
                {
                    "key": "Ersthelfer_Telefonnummer_{index}",
                    "original_key": "ContactPersonPhoneNumber",
                    "instance_key": "contactperson",
                    "label": "Telefonnummer",
                    "help_text": "",
                    "required": false,
                    "field_type": "text",
                    "choices": null,
                    "model": "ContactPerson",
                    "key_template": "Ersthelfer_Telefonnummer",
                    "expandable": true
                }
            ]
        },
        {
            "key": "Brandschutzhelfer",
            "title": "Brandschutzhelfer",
            "isCategory": true,
            "expandable": true,
            "min_instances": 1,
            "max_instances": 5,
            "fields": [
                {
                    "key": "Brandschutzhelfer_Name_{index}",
                    "original_key": "ContactPersonName",
                    "instance_key": "contactperson",
                    "label": "Name",
                    "help_text": "",
                    "required": true,
                    "field_type": "text",
                    "choices": null,
                    "model": "ContactPerson",
                    "key_template": "Brandschutzhelfer_Name",
                    "expandable": true
                },
                {
                    "key": "Brandschutzhelfer_Email_{index}",
                    "original_key": "ContactPersonEmail",
                    "instance_key": "contactperson",
                    "label": "Email",
                    "help_text": "",
                    "required": false,
                    "field_type": "email",
                    "choices": null,
                    "model": "ContactPerson",
                    "key_template": "Brandschutzhelfer_Email",
                    "expandable": true
                }
            ]
        },
        {
            "key": "Nächstes Krankenhaus",
            "title": "Nächstes Krankenhaus",
            "isCategory": true,
            "expandable": false,
            "fields": [
                {
                    "key": "Nächstes Krankenhaus_Name des Krankenhauses",
                    "original_key": "ContactPersonName",
                    "instance_key": "contactperson",
                    "label": "Name des Krankenhauses",
                    "help_text": "",
                    "required": true,
                    "field_type": "text",
                    "choices": null,
                    "model": "ContactPerson"
                },
                {
                    "key": "Nächstes Krankenhaus_Straße und Hausnummer",
                    "original_key": "ContactPersonEmail",
                    "instance_key": "contactperson",
                    "label": "Straße und Hausnummer",
                    "help_text": "",
                    "required": false,
                    "field_type": "text",
                    "choices": null,
                    "model": "ContactPerson"
                },
                {
                    "key": "Nächstes Krankenhaus_Postleitzahl",
                    "original_key": "ContactPersonPhoneNumber",
                    "instance_key": "contactperson",
                    "label": "Postleitzahl",
                    "help_text": "",
                    "required": false,
                    "field_type": "text",
                    "choices": null,
                    "model": "ContactPerson"
                },
                {
                    "key": "Nächstes Krankenhaus_Telefonnummer",
                    "original_key": "ContactType",
                    "instance_key": "contactperson",
                    "label": "Telefonnummer",
                    "help_text": "",
                    "required": true,
                    "field_type": "number",
                    "choices": [
                        {
                            "value": 1,
                            "label": "Emergency"
                        },
                        {
                            "value": 2,
                            "label": "Non-Emergency"
                        },
                        {
                            "value": 3,
                            "label": "Internal"
                        },
                        {
                            "value": 4,
                            "label": "External"
                        }
                    ],
                    "model": "ContactPerson"
                }
            ]
        },
        {
            "key": "Wichtige Kontakte",
            "title": "Wichtige Kontakte",
            "isCategory": true,
            "expandable": false,
            "fields": [
                {
                    "key": "Wichtige Kontakte_Nummer des Giftnotrufs",
                    "original_key": "PoisonEmergencyHotline",
                    "instance_key": "alarmplan",
                    "label": "Nummer des Giftnotrufs",
                    "help_text": "",
                    "required": false,
                    "field_type": "text",
                    "choices": null,
                    "model": "Alarmplan"
                },
                {
                    "key": "Wichtige Kontakte_Name des Branch Managers",
                    "original_key": "ContactPersonName",
                    "instance_key": "contactperson",
                    "label": "Name des Branch Managers",
                    "help_text": "",
                    "required": true,
                    "field_type": "text",
                    "choices": null,
                    "model": "ContactPerson"
                },
                {
                    "key": "Wichtige Kontakte_Email des Branch Managers",
                    "original_key": "ContactPersonEmail",
                    "instance_key": "contactperson",
                    "label": "Email des Branch Managers",
                    "help_text": "",
                    "required": false,
                    "field_type": "email",
                    "choices": null,
                    "model": "ContactPerson"
                },
                {
                    "key": "Wichtige Kontakte_Name des Geschaftsführers",
                    "original_key": "ContactPersonName",
                    "instance_key": "contactperson",
                    "label": "Name des Geschaftsführers",
                    "help_text": "",
                    "required": true,
                    "field_type": "text",
                    "choices": null,
                    "model": "ContactPerson"
                },
                {
                    "key": "Wichtige Kontakte_Email des Geschäftsführers",
                    "original_key": "ContactPersonEmail",
                    "instance_key": "contactperson",
                    "label": "Email des Geschäftsführers",
                    "help_text": "",
                    "required": false,
                    "field_type": "email",
                    "choices": null,
                    "model": "ContactPerson"
                }
            ]
        }
    ]
};
