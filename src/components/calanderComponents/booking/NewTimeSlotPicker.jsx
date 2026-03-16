import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Grid2 } from '@mui/material';
// import SkeletonCard from '../components/skeletonCard';
// import theme from '../theme';

const TimeSlotsComponent = ({ }) => {

    const schedules = [{ "title": 5, "data": ["05:00", "05:05", "05:10", "05:15", "05:20", "05:25", "05:30", "05:35", "05:40", "05:45", "05:50", "05:55"] }, { "title": 6, "data": ["06:00", "06:05", "06:10", "06:15", "06:20", "06:25", "06:30", "06:35", "06:40", "06:45", "06:50", "06:55"] }, { "title": 7, "data": ["07:00", "07:05", "07:10", "07:15", "07:20", "07:25", "07:30", "07:35", "07:40", "07:45", "07:50", "07:55"] }, { "title": 8, "data": ["08:00", "08:05", "08:10", "08:15", "08:20", "08:25", "08:30", "08:35", "08:40", "08:45", "08:50", "08:55"] }, { "title": 9, "data": ["09:00", "09:05", "09:10", "09:15", "09:20", "09:25", "09:30", "09:35", "09:40", "09:45", "09:50", "09:55"] }, { "title": 10, "data": ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30", "10:35", "10:40", "10:45", "10:50", "10:55"] }, { "title": 11, "data": ["11:00", "11:05", "11:10", "11:15", "11:20", "11:25", "11:30", "11:35", "11:40", "11:45", "11:50", "11:55"] }, { "title": 12, "data": ["12:00", "12:05", "12:10", "12:15", "12:20", "12:25", "12:30", "12:35", "12:40", "12:45", "12:50", "12:55"] }, { "title": 13, "data": ["13:00", "13:05", "13:10", "13:15", "13:20", "13:25", "13:30", "13:35", "13:40", "13:45", "13:50", "13:55"] }, { "title": 14, "data": ["14:00", "14:05", "14:10", "14:15", "14:20", "14:25", "14:30", "14:35", "14:40", "14:45", "14:50", "14:55"] }, { "title": 15, "data": ["15:00", "15:05", "15:10", "15:15", "15:20", "15:25", "15:30", "15:35", "15:40", "15:45", "15:50", "15:55"] }, { "title": 16, "data": ["16:00", "16:05", "16:10", "16:15", "16:20", "16:25", "16:30", "16:35", "16:40", "16:45", "16:50", "16:55"] }, { "title": 17, "data": ["17:00", "17:05", "17:10", "17:15", "17:20", "17:25", "17:30", "17:35", "17:40", "17:45", "17:50", "17:55"] }, { "title": 18, "data": ["18:00", "18:05", "18:10", "18:15", "18:20", "18:25", "18:30", "18:35", "18:40", "18:45", "18:50", "18:55"] }, { "title": 19, "data": ["19:00", "19:05", "19:10", "19:15", "19:20", "19:25", "19:30", "19:35", "19:40", "19:45", "19:50", "19:55"] }]
    const availableSlotTimeList = ["10:40", "10:45", "10:50", "10:55", "11:00", "11:05", "11:10", "11:15", "11:20", "11:25", "11:30", "11:35", "11:40", "11:45", "11:50", "11:55", "12:00", "12:05", "12:10", "12:15", "12:20", "12:25", "12:30", "12:35", "12:40", "12:45", "12:50", "12:55", "13:00", "13:05", "13:10", "13:15", "13:20", "13:25", "13:30", "13:35", "13:40", "13:45", "13:50", "13:55", "14:00", "14:05", "14:10", "14:15", "14:20", "14:25", "14:30", "14:35", "14:40", "14:45", "14:50", "14:55", "15:00", "15:05", "15:10", "15:15", "15:20", "15:25", "15:30", "15:35", "15:40", "15:45", "15:50", "15:55", "16:00", "16:05", "16:10", "16:15", "16:20", "16:25", "16:30", "16:35", "16:40", "16:45", "16:50", "16:55", "17:00"]
    const handleSlotSelect = undefined;
    const isLoading = false;
    const bookingDetails = {
        "outletId": 200,
        "selectedCategory": {
            "outlet_id": 200,
            "id": 416,
            "created_at": "2025-02-27T12:50:13.157237",
            "group": "13/B",
            "deleted_at": null,
            "marketplace_hidden": false,
            "updated_at": "2025-02-27T13:10:24.334792",
            "sequence": null,
            "services": [
                {
                    "image": null,
                    "special_price": "0",
                    "cancellation_offer_booked": false,
                    "room_id": null,
                    "service_type_ids": [
                        7
                    ],
                    "duration_text": "3 h",
                    "special_percentage": "0",
                    "is_price_starts_with": true,
                    "created_at": "2025-02-27T13:00:46.771469",
                    "duration_min": 180,
                    "special_source_id": null,
                    "is_consultation": false,
                    "updated_at": "2025-02-28T08:20:05.827041",
                    "price": "899",
                    "is_cancellation_offer": false,
                    "is_bundle_offer": false,
                    "deleted_at": null,
                    "sequence": 3,
                    "is_certified": true,
                    "cancellation_offer_price": "0",
                    "is_new_service": true,
                    "service_type_id": 7,
                    "group_id": 416,
                    "id": 1809,
                    "is_equipment_service": false,
                    "cancellation_offer_booking_source_id": null,
                    "is_offer_to_new_clients": false,
                    "description": "",
                    "no_of_equipments": 1,
                    "cancellation_offer_slot_start": null,
                    "is_offer_to_regular_clients": false,
                    "outlet_id": 200,
                    "name": "BOOKINg",
                    "is_special": false,
                    "cancellation_offer_slot_end": null,
                    "is_follow_up_treatment": false,
                    "employees": [
                        {
                            "phone_number": "89089089",
                            "deleted_at": null,
                            "image": "uploads/employee_pics/639de6af-ca78-47bd-add5-e3875bbaefc2.jpg",
                            "sequence": 0,
                            "journal_access": true,
                            "outlet_id": 200,
                            "access_code": "111111",
                            "id": 384,
                            "role": "EMPLOYEE",
                            "country_code": "+45",
                            "superadmin": false,
                            "created_at": "2025-01-08T11:58:11.414316Z",
                            "name": "Sukhi",
                            "settings": {
                                "create_employee": false,
                                "change_permissions": false,
                                "crud_special_offers": false,
                                "view_special_offers": false,
                                "crud_services": false,
                                "view_service_list": false,
                                "change_department": false,
                                "create_department": false,
                                "view_insights": false,
                                "waiting_list": false,
                                "upload_pictures": false,
                                "edit_about_us": false,
                                "change_all_calender_interval": false,
                                "change_own_calender_interval": false,
                                "change_all_opening_hours": false,
                                "change_own_opening_hours": false,
                                "view_all_employees": false,
                                "delete_all_bookings": false,
                                "delete_own_bookings": false,
                                "reschedule_all_bookings": false,
                                "reschedule_own_bookings": false,
                                "crud_cancellation_offer": false,
                                "create_customers": false,
                                "edit_customers": false,
                                "delete_customers": false,
                                "create_journals": false,
                                "edit_all_journals": false,
                                "edit_own_journals": false,
                                "view_all_journals": false,
                                "view_own_journals": false,
                                "checkout": false,
                                "crud_service_groups": false
                            },
                            "updated_at": "2025-02-20T04:46:18.924377Z",
                            "price": "899"
                        },
                        {
                            "phone_number": "235863888",
                            "deleted_at": null,
                            "image": null,
                            "sequence": 10,
                            "journal_access": true,
                            "outlet_id": 200,
                            "access_code": "111111",
                            "id": 350,
                            "role": "ADMIN",
                            "country_code": "+45",
                            "superadmin": false,
                            "created_at": "2024-10-07T12:34:53.466061Z",
                            "name": "Dev",
                            "settings": {
                                "create_employee": true,
                                "change_permissions": true,
                                "crud_special_offers": true,
                                "view_special_offers": true,
                                "crud_services": true,
                                "view_service_list": true,
                                "change_department": true,
                                "create_department": true,
                                "view_insights": true,
                                "waiting_list": true,
                                "upload_pictures": true,
                                "edit_about_us": true,
                                "change_all_calender_interval": true,
                                "change_own_calender_interval": true,
                                "change_all_opening_hours": true,
                                "change_own_opening_hours": true,
                                "view_all_employees": true,
                                "delete_all_bookings": true,
                                "delete_own_bookings": true,
                                "reschedule_all_bookings": true,
                                "reschedule_own_bookings": true,
                                "crud_cancellation_offer": true,
                                "create_customers": true,
                                "edit_customers": true,
                                "delete_customers": true,
                                "create_journals": true,
                                "edit_all_journals": true,
                                "edit_own_journals": true,
                                "view_all_journals": true,
                                "view_own_journals": true,
                                "checkout": true,
                                "crud_service_groups": true
                            },
                            "updated_at": "2025-02-20T07:29:42.207570Z",
                            "price": "899"
                        },
                        {
                            "phone_number": "88787878",
                            "deleted_at": null,
                            "image": null,
                            "sequence": 11,
                            "journal_access": false,
                            "outlet_id": 200,
                            "access_code": "111111",
                            "id": 436,
                            "role": "EMPLOYEE",
                            "country_code": "+45",
                            "superadmin": false,
                            "created_at": "2025-01-31T10:19:06.068792Z",
                            "name": "Dax",
                            "settings": {
                                "create_employee": true,
                                "change_permissions": true,
                                "crud_special_offers": true,
                                "crud_services": true,
                                "crud_service_groups": true,
                                "change_department": true,
                                "create_department": true,
                                "view_insights": true,
                                "waiting_list": true,
                                "upload_pictures": true,
                                "edit_about_us": true,
                                "change_all_calender_interval": true,
                                "change_own_calender_interval": true,
                                "change_all_opening_hours": true,
                                "change_own_opening_hours": true,
                                "view_all_employees": true,
                                "delete_all_bookings": true,
                                "delete_own_bookings": true,
                                "reschedule_all_bookings": true,
                                "reschedule_own_bookings": true,
                                "crud_cancellation_offer": true,
                                "create_customers": true,
                                "edit_customers": true,
                                "delete_customers": true,
                                "create_journals": true,
                                "edit_all_journals": true,
                                "edit_own_journals": true,
                                "view_all_journals": true,
                                "view_own_journals": true,
                                "checkout": true
                            },
                            "updated_at": "2025-02-08T11:08:06.640392Z",
                            "price": "899"
                        },
                        {
                            "phone_number": "12312312",
                            "deleted_at": null,
                            "image": null,
                            "sequence": 12,
                            "journal_access": false,
                            "outlet_id": 200,
                            "access_code": "222222",
                            "id": 415,
                            "role": "EMPLOYEE",
                            "country_code": "+45",
                            "superadmin": false,
                            "created_at": "2025-01-22T12:58:22.929039Z",
                            "name": "Mukund Hadiya",
                            "settings": {
                                "create_employee": true,
                                "change_permissions": true,
                                "crud_special_offers": true,
                                "crud_services": true,
                                "crud_service_groups": true,
                                "change_department": true,
                                "create_department": true,
                                "view_insights": true,
                                "waiting_list": true,
                                "upload_pictures": true,
                                "edit_about_us": true,
                                "change_all_calender_interval": true,
                                "change_own_calender_interval": true,
                                "change_all_opening_hours": true,
                                "change_own_opening_hours": true,
                                "view_all_employees": true,
                                "delete_all_bookings": true,
                                "delete_own_bookings": true,
                                "reschedule_all_bookings": true,
                                "reschedule_own_bookings": true,
                                "crud_cancellation_offer": true,
                                "create_customers": true,
                                "edit_customers": true,
                                "delete_customers": true,
                                "create_journals": true,
                                "edit_all_journals": true,
                                "edit_own_journals": true,
                                "view_all_journals": true,
                                "view_own_journals": true,
                                "checkout": true
                            },
                            "updated_at": "2025-02-08T11:08:06.645332Z",
                            "price": "899"
                        }
                    ]
                }
            ]
        },
        "selectedService": {
            "image": null,
            "special_price": "0",
            "cancellation_offer_booked": false,
            "room_id": null,
            "service_type_ids": [
                7
            ],
            "duration_text": "3 h",
            "special_percentage": "0",
            "is_price_starts_with": true,
            "created_at": "2025-02-27T13:00:46.771469",
            "duration_min": 180,
            "special_source_id": null,
            "is_consultation": false,
            "updated_at": "2025-02-28T08:20:05.827041",
            "price": "899",
            "is_cancellation_offer": false,
            "is_bundle_offer": false,
            "deleted_at": null,
            "sequence": 3,
            "is_certified": true,
            "cancellation_offer_price": "0",
            "is_new_service": true,
            "service_type_id": 7,
            "group_id": 416,
            "id": 1809,
            "is_equipment_service": false,
            "cancellation_offer_booking_source_id": null,
            "is_offer_to_new_clients": false,
            "description": "",
            "no_of_equipments": 1,
            "cancellation_offer_slot_start": null,
            "is_offer_to_regular_clients": false,
            "outlet_id": 200,
            "name": "BOOKINg",
            "is_special": false,
            "cancellation_offer_slot_end": null,
            "is_follow_up_treatment": false,
            "employees": [
                {
                    "phone_number": "89089089",
                    "deleted_at": null,
                    "image": "uploads/employee_pics/639de6af-ca78-47bd-add5-e3875bbaefc2.jpg",
                    "sequence": 0,
                    "journal_access": true,
                    "outlet_id": 200,
                    "access_code": "111111",
                    "id": 384,
                    "role": "EMPLOYEE",
                    "country_code": "+45",
                    "superadmin": false,
                    "created_at": "2025-01-08T11:58:11.414316Z",
                    "name": "Sukhi",
                    "settings": {
                        "create_employee": false,
                        "change_permissions": false,
                        "crud_special_offers": false,
                        "view_special_offers": false,
                        "crud_services": false,
                        "view_service_list": false,
                        "change_department": false,
                        "create_department": false,
                        "view_insights": false,
                        "waiting_list": false,
                        "upload_pictures": false,
                        "edit_about_us": false,
                        "change_all_calender_interval": false,
                        "change_own_calender_interval": false,
                        "change_all_opening_hours": false,
                        "change_own_opening_hours": false,
                        "view_all_employees": false,
                        "delete_all_bookings": false,
                        "delete_own_bookings": false,
                        "reschedule_all_bookings": false,
                        "reschedule_own_bookings": false,
                        "crud_cancellation_offer": false,
                        "create_customers": false,
                        "edit_customers": false,
                        "delete_customers": false,
                        "create_journals": false,
                        "edit_all_journals": false,
                        "edit_own_journals": false,
                        "view_all_journals": false,
                        "view_own_journals": false,
                        "checkout": false,
                        "crud_service_groups": false
                    },
                    "updated_at": "2025-02-20T04:46:18.924377Z",
                    "price": "899"
                },
                {
                    "phone_number": "235863888",
                    "deleted_at": null,
                    "image": null,
                    "sequence": 10,
                    "journal_access": true,
                    "outlet_id": 200,
                    "access_code": "111111",
                    "id": 350,
                    "role": "ADMIN",
                    "country_code": "+45",
                    "superadmin": false,
                    "created_at": "2024-10-07T12:34:53.466061Z",
                    "name": "Dev",
                    "settings": {
                        "create_employee": true,
                        "change_permissions": true,
                        "crud_special_offers": true,
                        "view_special_offers": true,
                        "crud_services": true,
                        "view_service_list": true,
                        "change_department": true,
                        "create_department": true,
                        "view_insights": true,
                        "waiting_list": true,
                        "upload_pictures": true,
                        "edit_about_us": true,
                        "change_all_calender_interval": true,
                        "change_own_calender_interval": true,
                        "change_all_opening_hours": true,
                        "change_own_opening_hours": true,
                        "view_all_employees": true,
                        "delete_all_bookings": true,
                        "delete_own_bookings": true,
                        "reschedule_all_bookings": true,
                        "reschedule_own_bookings": true,
                        "crud_cancellation_offer": true,
                        "create_customers": true,
                        "edit_customers": true,
                        "delete_customers": true,
                        "create_journals": true,
                        "edit_all_journals": true,
                        "edit_own_journals": true,
                        "view_all_journals": true,
                        "view_own_journals": true,
                        "checkout": true,
                        "crud_service_groups": true
                    },
                    "updated_at": "2025-02-20T07:29:42.207570Z",
                    "price": "899"
                },
                {
                    "phone_number": "88787878",
                    "deleted_at": null,
                    "image": null,
                    "sequence": 11,
                    "journal_access": false,
                    "outlet_id": 200,
                    "access_code": "111111",
                    "id": 436,
                    "role": "EMPLOYEE",
                    "country_code": "+45",
                    "superadmin": false,
                    "created_at": "2025-01-31T10:19:06.068792Z",
                    "name": "Dax",
                    "settings": {
                        "create_employee": true,
                        "change_permissions": true,
                        "crud_special_offers": true,
                        "crud_services": true,
                        "crud_service_groups": true,
                        "change_department": true,
                        "create_department": true,
                        "view_insights": true,
                        "waiting_list": true,
                        "upload_pictures": true,
                        "edit_about_us": true,
                        "change_all_calender_interval": true,
                        "change_own_calender_interval": true,
                        "change_all_opening_hours": true,
                        "change_own_opening_hours": true,
                        "view_all_employees": true,
                        "delete_all_bookings": true,
                        "delete_own_bookings": true,
                        "reschedule_all_bookings": true,
                        "reschedule_own_bookings": true,
                        "crud_cancellation_offer": true,
                        "create_customers": true,
                        "edit_customers": true,
                        "delete_customers": true,
                        "create_journals": true,
                        "edit_all_journals": true,
                        "edit_own_journals": true,
                        "view_all_journals": true,
                        "view_own_journals": true,
                        "checkout": true
                    },
                    "updated_at": "2025-02-08T11:08:06.640392Z",
                    "price": "899"
                },
                {
                    "phone_number": "12312312",
                    "deleted_at": null,
                    "image": null,
                    "sequence": 12,
                    "journal_access": false,
                    "outlet_id": 200,
                    "access_code": "222222",
                    "id": 415,
                    "role": "EMPLOYEE",
                    "country_code": "+45",
                    "superadmin": false,
                    "created_at": "2025-01-22T12:58:22.929039Z",
                    "name": "Mukund Hadiya",
                    "settings": {
                        "create_employee": true,
                        "change_permissions": true,
                        "crud_special_offers": true,
                        "crud_services": true,
                        "crud_service_groups": true,
                        "change_department": true,
                        "create_department": true,
                        "view_insights": true,
                        "waiting_list": true,
                        "upload_pictures": true,
                        "edit_about_us": true,
                        "change_all_calender_interval": true,
                        "change_own_calender_interval": true,
                        "change_all_opening_hours": true,
                        "change_own_opening_hours": true,
                        "view_all_employees": true,
                        "delete_all_bookings": true,
                        "delete_own_bookings": true,
                        "reschedule_all_bookings": true,
                        "reschedule_own_bookings": true,
                        "crud_cancellation_offer": true,
                        "create_customers": true,
                        "edit_customers": true,
                        "delete_customers": true,
                        "create_journals": true,
                        "edit_all_journals": true,
                        "edit_own_journals": true,
                        "view_all_journals": true,
                        "view_own_journals": true,
                        "checkout": true
                    },
                    "updated_at": "2025-02-08T11:08:06.645332Z",
                    "price": "899"
                }
            ]
        },
        "selectedEmployee": {
            "phone_number": "89089089",
            "deleted_at": null,
            "image": "uploads/employee_pics/639de6af-ca78-47bd-add5-e3875bbaefc2.jpg",
            "sequence": 0,
            "journal_access": true,
            "outlet_id": 200,
            "access_code": "111111",
            "id": 384,
            "role": "EMPLOYEE",
            "country_code": "+45",
            "superadmin": false,
            "created_at": "2025-01-08T11:58:11.414316Z",
            "name": "Sukhi",
            "settings": {
                "create_employee": false,
                "change_permissions": false,
                "crud_special_offers": false,
                "view_special_offers": false,
                "crud_services": false,
                "view_service_list": false,
                "change_department": false,
                "create_department": false,
                "view_insights": false,
                "waiting_list": false,
                "upload_pictures": false,
                "edit_about_us": false,
                "change_all_calender_interval": false,
                "change_own_calender_interval": false,
                "change_all_opening_hours": false,
                "change_own_opening_hours": false,
                "view_all_employees": false,
                "delete_all_bookings": false,
                "delete_own_bookings": false,
                "reschedule_all_bookings": false,
                "reschedule_own_bookings": false,
                "crud_cancellation_offer": false,
                "create_customers": false,
                "edit_customers": false,
                "delete_customers": false,
                "create_journals": false,
                "edit_all_journals": false,
                "edit_own_journals": false,
                "view_all_journals": false,
                "view_own_journals": false,
                "checkout": false,
                "crud_service_groups": false
            },
            "updated_at": "2025-02-20T04:46:18.924377Z",
            "price": "899"
        },
        "selectedDate": "2025-03-01T08:36:26.813Z",
        "selectedSlot": null,
        "customerData": {
            "customerFirstName": "",
            "customerLastName": "",
            "customerEmail": "",
            "customerAddress": "",
            "zipCode": "",
            "city": "",
            "phoneNumber": "",
            "note": "",
            "dateOfBirth": null,
            "cprNumber": "",
            "checkstate": false
        },
        "employeeHours": true
    }

    const [scheduleData, setScheduleData] = useState([]);
    const [selectedAvailableSlot, setSelectedAvailableSlot] = useState(null);

    useEffect(() => {
        setSelectedAvailableSlot(bookingDetails?.selectedSlot)
    }, [bookingDetails])

    useEffect(() => {
        if (schedules) {
            setScheduleData(schedules)
        }
    }, [schedules]);

    const TimeSlotsGrid = ({ data }) => {
        const renderTimeSlot = ({ item, index }) => {
            if (!item) return null;
            let isAvailable = true
            let isFifteenMinutes = false

            let isSelected = false

            if (!availableSlotTimeList.includes(item)) {
                isAvailable = false
            }

            if (item.split(':')[1] % 15 == 0) {
                isFifteenMinutes = true
            }

            if (selectedAvailableSlot) {
                if (selectedAvailableSlot.split(' - ')[0] == `${item}`) {
                    isSelected = true
                }
            }

            return (

                <Grid2 item
                    size={{ xs: 2, md: 2 }}
                    key={index}
                    sx={{
                        display: 'flex', justifyContent: 'center', fontWeight: 'bold',
                        backgroundColor: selectedAvailableSlot === item ? '#F7BD98' : (isAvailable ? (isFifteenMinutes ? '#f2f2f2' : 'white') : '#C7414180'),
                        fontSize: '7px',
                        height: { xs: 50, md: 50 },
                        borderRadius: '15px',
                        border: `1px solid #dde0f4`
                    }}>
                    <Button
                        disabled={!isAvailable}
                        onClick={() => {
                            setSelectedAvailableSlot(item);
                            handleSlotSelect(item);
                        }}
                        sx={{
                            color: (selectedAvailableSlot === item || !isAvailable) ? 'black' : 'black',
                            "&:disabled": {
                                color: 'black'
                            },
                            fontSize: '0.75rem'

                        }}
                    >
                        {item}
                    </Button>
                </Grid2>
            );
        };

        return (
            <Grid2 container spacing={{ xs: 1, md: 1 }} size={{ md: 11.4, xs: 11.4 }}>
                {data.map((item, index) => renderTimeSlot({ item, index }))}
            </Grid2>
        );
    };

    const formatTimeTitle = (time) => {
        const parts = time.toString().split(':');
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1] ? parts[1].padStart(2, '0') : '00';
        return `${hours}:${minutes}`;
    };

    return (
        <Box sx={{ width: '100%', height: '420px', overflowY: 'auto', pr: 2, pt: { xs: 1 }, pb: { xs: 2 }, minWidth: { xs: 300, md: 400 } }} justifyContent={'center'} alignItems={'center'}>
            {scheduleData.map((scheduleDataObj, index) => (
                <React.Fragment key={index}>
                    <Typography style={{ color: 'black', marginBottom: 5, pl: { xs: 0, md: 10 } }}>
                        {formatTimeTitle(scheduleDataObj.title)}
                    </Typography>
                    <TimeSlotsGrid data={scheduleDataObj?.data} title={scheduleDataObj?.title} />
                </React.Fragment>
            ))}
        </Box>
    );
};

export default TimeSlotsComponent;
