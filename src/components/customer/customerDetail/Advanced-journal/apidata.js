export const apiJson = {
    "data": {
        format: {
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
                                    "value": "2025-02-08T10:00:00",
                                    "required": false,
                                    "validation": "date",
                                    "fieldSequence": 1
                                },
                                {
                                    "field_id": 111112,
                                    "type": "cpr",
                                    "name": "CPR Number",
                                    "value": "1122334455",
                                    "required": true,
                                    "validation": "cpr",
                                    "fieldSequence": 2
                                },
                                {
                                    "field_id": 111113,
                                    "type": "upload",
                                    "name": "Picture Before",
                                    "value": ["https://th.bing.com/th/id/OIP.9LvOH_gHjH9LUmVubKgHhQHaE8?pid=ImgDet&w=192&h=128&c=7", "https://th.bing.com/th/id/OIP.J3JPYR_212EVwInodDdv5AHaE6?pid=ImgDet&w=192&h=127&c=7"],
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 3
                                },
                                {
                                    "field_id": 111114,
                                    "type": "upload",
                                    "name": "Picture After",
                                    "value": ["https://picsum.photos/600/400?random=13&brightness=0.5", "https://picsum.photos/700/500?random=14&brightness=0.5"],
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 4
                                },
                                {
                                    "field_id": 111115,
                                    "type": "textarea",
                                    "name": "journal_notes",
                                    "value": "this is a journal notes",
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 5
                                },
                                {
                                    "field_id": 111116,
                                    "name": "Journal Editor",
                                    "type": "editor",
                                    "journal_name": "journal 12ka4",
                                    "templateId": 1,
                                    "value": `<p><strong class="ql-size-huge">How to Build a Sustainable Future</strong></p><p>This blog post dives into the importance of sustainability in today's world. <strong>Investing in green energy is key</strong> to a better tomorrow.</p><p>Steps You Can Take</p><p><em><s><u>Start small, think big. The first step in achieving sustainability is reducing waste. A simple change, like using less plastic, can have a major impact.</u></s></em></p><ul><li>Switch to electric cars</li><li><span style="color: rgb(230, 0, 0);">Reduce water usage</span></li><li><span style="color: rgb(230, 0, 0);">Support eco-friendly companies</span></li></ul><pre class="ql-syntax" spellcheck="false">let sustainableAction = 'Reduce, Reuse, Recycle';
</pre><p><em>It's essential that we start taking action now. Our future depends on it.</em><strong><em> </em></strong><a href="https://greenworld.com" rel="noopener noreferrer" target="_blank"><strong>Join the green revolution</strong></a> <em>today.</em></p>`,
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 6
                                     
                                },
                                {
                                    "field_id": 111117,
                                    "type": "select",
                                    "name": "Pushpa Kya hai?",
                                    "value": "Fire",
                                    "options": ["Fire", "Flower", "Kuch bhi ho", "other"],
                                    "include_other": true,
                                    "value_other": "",
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 7
                                },
                                {
                                    "field_id": 111118,
                                    "type": "select",
                                    "name": "Select the method",
                                    "value": "Reduce",
                                    "options": ["Reduce", "Conserve", "Transition"],
                                    "include_other": false,
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 7
                                },
                                {
                                    "field_id": 111119,
                                    "type": "checkbox",
                                    "name": "Treatment",
                                    "options": ["Hair Transplant", "Lips Filler", "Facelift"],
                                    "value": ["Hair Transplant", "Lips Filler"],
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 8
                                },
                                {
                                    "field_id": 111120,
                                    "type": "radio",
                                    "name": "Treatment On Part",
                                    "options": ["Face", "Hair", "Lips"],
                                    "value": "Hair",
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 9
                                },
                                {
                                    "field_id": 111121,
                                    "type": "signature",
                                    "name": "signature of patient",
                                    "value": null,
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 10
                                },
                                {
                                    "field_id": 111122,
                                    "type": "signature",
                                    "name": "signature of doctor",
                                    "value": "https://picsum.photos/600/400?random=12&grayscale",
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 11
                                },
                                {
                                    "field_id": 111123,
                                    "type": "autoFill_name",
                                    "name": "Customer Name",
                                    "value": null,
                                    "autofill": true,
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 12
                                },
                                {
                                    "field_id": 111124,
                                    "type": "autoFill_phone",
                                    "name": "Customer Phone",
                                    "value": null,
                                    "autofill": true,
                                    "required": false,
                                    "validation": 'phone',
                                    "fieldSequence": 13
                                },
                                {
                                    "field_id": 111125,
                                    "type": "autoFill_email",
                                    "name": "Customer Email",
                                    "value": null,
                                    "autofill": true,
                                    "required": false,
                                    "validation": 'email',
                                    "fieldSequence": 14
                                },
                                {
                                    "field_id": 111126,
                                    "type": "autoFill_address",
                                    "name": "Customer Address",
                                    "value": null,
                                    "autofill": true,
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 15
                                },
                                {
                                    "field_id": 111127,
                                    "type": "autoFill_cpr",
                                    "name": "Customer CPR",
                                    "value": null,
                                    "autofill": true,
                                    "required": false,
                                    "validation": 'cpr',
                                    "fieldSequence": 16
                                },
                                {
                                    "field_id": 111128,
                                    "type": "autoFill_birthday",
                                    "name": "Customer Birthday",
                                    "value": null,
                                    "autofill": true,
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 17
                                },
                                {
                                    "field_id": 111129,
                                    "type": "small_text",
                                    "name": "Small Field",
                                    "value": null,
                                    "autofill": false,
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 18
                                },
                                {
                                    "field_id": 111130,
                                    "type": "text",
                                    "name": "Regular Field",
                                    "value": null,
                                    "autofill": false,
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 18
                                },
                                {
                                    "field_id": 111131,
                                    "type": "image",
                                    "name": "image field",
                                    "value": "uploads/files/1c530d7e-f5d9-451a-ae4d-0d7789e7cf1f.jpeg",
                                    "image_id": 15,
                                    "image_name" : "image1.jpg",
                                    "autofill": false,
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 18
                                },
                            ],

                            "save": true,
                            "posted": false,
                            // add timestamp for updated_at and created_at
                            "updated_at": "2025-02-02T10:00:00",
                            "created_at": "2025-01-06T10:00:00"
                        },
                        {
                            "detail_id": 1311,
                            "name": "Journal 3",
                            "fields": [
                                {
                                    "field_id": 131111,
                                    "type": "date",
                                    "name": "date",
                                    "value": "2025-02-10T10:00:00",
                                    "required": true,
                                    "validation": "date",
                                    "fieldSequence": 1
                                },
                                {
                                    "field_id": 131112,
                                    "type": "cpr",
                                    "name": "CPR Number",
                                    "value": "3344556677",
                                    "required": true,
                                    "validation": "cpr",
                                    "fieldSequence": 2
                                },
                                {
                                    "field_id": 131113,
                                    "type": "upload",
                                    "name": "Picture After Full Recovery",
                                    "value": ["https://picsum.photos/600/400", "https://picsum.photos/700/500"],
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 3
                                },
                                {
                                    "field_id": 131114,
                                    "type": "textarea",
                                    "name": "recovery_notes",
                                    "value": "Patient is doing well and recovering as expected.",
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 4
                                },

                                {
                                    "field_id": 131116,
                                    "type": "select",
                                    "name": "recovery_status",
                                    "value": "Fully Recovered",
                                    "options": ["Fully Recovered", "In Recovery", "Requires Further Treatment"],
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 6
                                },

                            ],
                            "save": true,
                            "posted": true,
                            "updated_at": "2025-02-01T10:00:00",
                            "created_at": "2025-01-15T10:00:00"
                        },
                        {
                            "detail_id": 1211,
                            "name": "Journal 2",
                            "fields": [
                                {
                                    "field_id": 121111,
                                    "type": "date",
                                    "name": "date",
                                    "value": "2025-02-09T10:00:00",
                                    "required": true,
                                    "validation": "date",
                                    "fieldSequence": 1
                                },

                                {
                                    "field_id": 121113,
                                    "type": "upload",
                                    "name": "Picture After Treatment",
                                    "value": ["https://picsum.photos/600/400", "https://picsum.photos/700/500"],
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 3
                                },

                                {
                                    "field_id": 121115,
                                    "type": "editor",
                                    "journal_name": "journal 15ka4",
                                    "templateId": 2,
                                    "value": "<p><strong class='ql-size-huge'>Post-Treatment Care</strong></p><p>After undergoing treatment, it is essential to follow up with proper care to ensure a smooth recovery. <strong>Hydrate, rest, and follow instructions</strong> from your doctor for the best results.</p><ul><li>Take prescribed medications</li><li>Avoid strenuous activities</li><li>Stay hydrated</li></ul><p><a href='https://posttreatmentcare.com' target='_blank'><strong>Learn more about recovery tips</strong></a></p>",
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 5
                                },

                            ],
                            "save": true,
                            "posted": true,
                            "updated_at": "2025-01-20T10:00:00",
                            "created_at": "2025-01-20T10:00:00"
                        },
                        {
                            "detail_id": 1411,
                            "name": "Follow-up Journal",
                            "fields": [
                                {
                                    "field_id": 141111,
                                    "type": "date",
                                    "name": "follow_up_date",
                                    "value": "2025-02-15T10:00:00",
                                    "required": true,
                                    "validation": "date",
                                    "fieldSequence": 1
                                },
                                {
                                    "field_id": 141112,
                                    "type": "cpr",
                                    "name": "CPR Number",
                                    "value": "4455667788",
                                    "required": true,
                                    "validation": "cpr",
                                    "fieldSequence": 2
                                },
                                {
                                    "field_id": 141113,
                                    "type": "upload",
                                    "name": "Follow-up Picture",
                                    "value": ["https://picsum.photos/600/400", "https://picsum.photos/700/500"],
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 3
                                },
                                {
                                    "field_id": 141114,
                                    "type": "textarea",
                                    "name": "follow_up_notes",
                                    "value": "Patient seems to be recovering well and is following post-treatment instructions.",
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 4
                                },
                                {
                                    "field_id": 141115,
                                    "type": "editor",
                                    "journal_name": "follow_up_journal_ka4",
                                    "templateId": 4,
                                    "value": "<p><strong class='ql-size-huge'>Follow-up Care</strong></p><p>During your follow-up appointment, we will assess your recovery and address any concerns you may have. It's important to continue taking care of yourself and maintain the treatments outlined in your plan.</p><ul><li>Monitor your progress</li><li>Keep appointments with healthcare professionals</li><li>Report any issues promptly</li></ul><p><a href='https://followupcare.com' target='_blank'><strong>Learn more about follow-up care</strong></a></p>",
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 5
                                },

                                {
                                    "field_id": 141120,
                                    "type": "signature",
                                    "name": "signature of god",
                                    "value": null,
                                    "required": false,
                                    "validation": null,
                                    "fieldSequence": 10
                                }
                            ],
                            "save": true,
                            "posted": true,
                            "updated_at": "2025-01-25T10:00:00",
                            "created_at": "2025-01-24T10:00:00"
                        }


                    ],
                    "logs": [
                        {
                            "logId": 1,
                            "incident": "Created ",
                            "date": "2025-02-06T10:00:00",
                            "employees": "em1 , em2",
                            "ip": "81.161.354.100"
                        },
                        {
                            "logId": 2,
                            "incident": "Edited ",
                            "date": "2025-02-07T10:00:00",
                            "employees": "em3",
                            "ip": "192.168.1.100"
                        },
                        {
                            "logId": 3,
                            "incident": "Completed ",
                            "date": "2025-02-08T10:00:00",
                            "employees": "em4",
                            "ip": "192.168.2.100"
                        }
                    ]

                },
                {
                    "tab_id": 12,
                    "label": "Treatment",
                    "bgcolor": "#CE7676",
                    "color": "#fff",
                    "tabSequence": 2,
                    "details": [],
                    "logs": [
                        {
                            "logId": 4,
                            "incident": "Created",
                            "date": "2025-02-07T11:00:00",
                            "employees": "em1, em2",
                            "ip": "81.161.354.101"
                        },
                        {
                            "logId": 5,
                            "incident": "Edited",
                            "date": "2025-02-08T11:00:00",
                            "employees": "em3",
                            "ip": "192.168.1.101"
                        },
                        {
                            "logId": 6,
                            "incident": "Completed",
                            "date": "2025-02-09T11:00:00",
                            "employees": "em4",
                            "ip": "192.168.2.101"
                        }
                    ]
                },
                {
                    "tab_id": 13,
                    "label": "After Treatment",
                    "bgcolor": "#79CCE4",
                    "color": "#fff",
                    "tabSequence": 3,
                    "details": [],
                    "logs": [
                        {
                            "logId": 7,
                            "incident": "Created",
                            "date": "2025-02-08T12:00:00",
                            "employees": "em1, em2",
                            "ip": "81.161.354.102"
                        },
                        {
                            "logId": 8,
                            "incident": "Edited",
                            "date": "2025-02-09T12:00:00",
                            "employees": "em3",
                            "ip": "192.168.1.102"
                        },
                        {
                            "logId": 9,
                            "incident": "Completed",
                            "date": "2025-02-10T12:00:00",
                            "employees": "em4",
                            "ip": "192.168.2.102"
                        }
                    ]
                },
                {
                    "tab_id": 14,
                    "label": "Follow up",
                    "bgcolor": "#A186E9",
                    "color": "#fff",
                    "tabSequence": 4,
                    "details": [],
                    "logs": [
                        {
                            "logId": 10,
                            "incident": "Created",
                            "date": "2025-02-09T13:00:00",
                            "employees": "em1, em2",
                            "ip": "81.161.354.103"
                        },
                        {
                            "logId": 11,
                            "incident": "Edited",
                            "date": "2025-02-10T13:00:00",
                            "employees": "em3",
                            "ip": "192.168.1.103"
                        },
                        {
                            "logId": 12,
                            "incident": "Completed",
                            "date": "2025-02-15T13:00:00",
                            "employees": "em4",
                            "ip": "192.168.2.103"
                        }
                    ]
                }




            ],
        }
    }
}