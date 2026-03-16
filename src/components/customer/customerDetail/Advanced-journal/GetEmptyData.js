export const GetInitialData = {
    "available-options": ["date", "cpr", "upload", "textarea", "editor", "select", "checkbox", "radio", "signature"],
    "tabsOptions": [
        {
            "tab_id": 11,
            "label": "Pre-treatment",
            "bgcolor": "#B1D667",
            "color": "#fff",
            "tabSequence": 1,
            "details": [
                {
                    "detail_id": 1111,
                    "name": "Journal 1",
                    "fields": [
                        {
                            "field_id": 111111,
                            "type": "date",
                            "name": "date",
                            "value": "",
                            "required": true,
                            "validation": "date",
                            "fieldSequence": 1
                        },
                        {
                            "field_id": 111112,
                            "type": "cpr",
                            "name": "CPR Number",
                            "value": "",
                            "required": true,
                            "validation": "cpr",
                            "fieldSequence": 2
                        },
                        {
                            "field_id": 111113,
                            "type": "upload",
                            "name": "Picture Before",
                            "value": [],
                            "required": false,
                            "validation": null,
                            "fieldSequence": 3
                        },
                        {
                            "field_id": 111114,
                            "type": "upload",
                            "name": "Picture After",
                            "value": [],
                            "required": false,
                            "validation": null,
                            "fieldSequence": 4
                        },
                        {
                            "field_id": 111115,
                            "type": "textarea",
                            "name": "journal_notes",
                            "value": "",
                            "required": false,
                            "validation": null,
                            "fieldSequence": 5
                        },
                        {
                            "field_id": 111116,
                            "name": "Journal Editor",
                            "type": "editor",
                            "journal_name": "journal 12ka4",
                            "templateId": null,
                            "value": "",
                            "required": false,
                            "validation": null,
                            "fieldSequence": 6
                        },
                        {
                            "field_id": 111117,
                            "type": "select",
                            "name": "Select the method",
                            "value": "",
                            "options": ["Reduce", "Conserve", "Transition"],
                            "required": false,
                            "validation": null,
                            "fieldSequence": 7
                        },
                        {
                            "field_id": 111118,
                            "type": "checkbox",
                            "name": "Treatment",
                            "options": ["Hair Transplant", "Lips Filler", "Facelift"],
                            "value": [],
                            "required": false,
                            "validation": null,
                            "fieldSequence": 8
                        },
                        {
                            "field_id": 111119,
                            "type": "radio",
                            "name": "Treatment On Part",
                            "options": ["Face", "Hair", "Lips"],
                            "value": "",
                            "required": true,
                            "validation": null,
                            "fieldSequence": 9
                        },
                        {
                            "field_id": 111120,
                            "type": "signature",
                            "name": "signature of patient",
                            "value": {},
                            "required": false,
                            "validation": null,
                            "fieldSequence": 10
                        },
                        {
                            "field_id": 111121,
                            "type": "signature",
                            "name": "signature of doctor",
                            "value": {},
                            "required": false,
                            "validation": null,
                            "fieldSequence": 11
                        }
                    ],

                    "save": false,
                    "posted": false,
                },


            ],
            "logs": []

        },
        {
            "tab_id": 12,
            "label": "Treatment",
            "bgcolor": "#CE7676",
            "color": "#fff",
            "tabSequence": 2,
            "details": [
                {
                    "detail_id": 1211,
                    "name": "Journal 1",
                    "fields": [
                        {
                            "field_id": 121112,
                            "type": "date",
                            "name": "date",
                            "value": "",
                            "required": true,
                            "validation": "date",
                            "fieldSequence": 2
                        },
                        {
                            "field_id": 111111,
                            "type": "select",
                            "name": "Select the method",
                            "value": "",
                            "options": ["Reduce", "Conserve", "Transition"],
                            "required": true,
                            "validation": null,
                            "fieldSequence": 1
                        },
                        {
                            "field_id": 111113,
                            "type": "checkbox",
                            "name": "Treatment",
                            "options": ["Hair Transplant", "Lips Filler", "Facelift"],
                            "value": [],
                            "required": false,
                            "validation": null,
                            "fieldSequence": 3
                        },
                        {
                            "field_id": 111114,
                            "type": "radio",
                            "name": "Treatment On Part",
                            "options": ["Face", "Hair", "Lips"],
                            "value": "",
                            "required": false,
                            "validation": null,
                            "fieldSequence": 4
                        },
                    ],

                    "save": true,
                    "posted": false,
                },
            ],
            "logs": []
        },
    ],
}