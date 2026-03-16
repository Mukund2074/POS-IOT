
import moment from "moment";
import { authLogin } from "../utils/Api/Authantication";
import { CreateCustomerApi, DeleteCustomerApi } from "../utils/Api/Customer";
import { CreateEmployeeApi, DeleteEmployeeApi } from "../utils/Api/Employee";
import { CreateService, DeleteService, GetServiceGroup, GetServiceTypes } from "../utils/Api/Service";
import FormData from 'form-data';
import { CreateBookingApi, DeleteBookingApi, GetTimingsApi } from "../utils/Api/Booking";
export var access_token = null;

export class TestCases {

    token = null;
    store = null;
    service_group = null;
    customer = null;
    service = null;
    service_types = null;
    employee = null;
    timings = null;
    booking = null;

    // login
    async TestAuthLogin() {
        const payload = {
            "country_code": "+45",
            "phone_number": "30600837",
            "password": "12345678",
        }
        const data = await authLogin({ payload })
        if (data) {
            this.token = data.data[0].access_token;
            access_token = data.data[0].access_token
            this.store = data.data[0]
        } else {
            return false;
        }
    }

    // create Employee
    async TestCreateEmployee() {
        const payload = { "name": "Qa Employee", "country_code": "+45", "phone_number": "00000011", "access_code": "000000", "journal_access": false, "role": "ADMIN", "remove_image": false }
        const formdata = new FormData();
        formdata.append('req_body', JSON.stringify(payload))
        try {
            const created = await CreateEmployeeApi({ formdata })
            if (created) {
                this.employee = created.data.data;
                return true
            }
        } catch (error) {
            return false;
        }
    }

    // create customer
    async TestCreateCustomer() {
        try {
            const payload = { "name": "Automation QA 1", "phone_number": "00000001", }
            const response = await CreateCustomerApi(payload)
            if (response) {
                this.customer = response.data.data
                return true;
            }
        } catch (error) {
            return false;
        }
    }

    // get service_types
    async TestGetServiceType() {
        try {
            const response = await GetServiceTypes()
            if (response) {
                this.service_types = response.data.data
                return true
            }
        } catch (error) {
            return false
        }
    }

    // get timings 
    async TestGetTimings() {
        try {

            const params = { service_id: this.service?.id, date: moment().format("YYYY-MM-DD"), employee_id: this.employee?.id, custom_duration: 60 }
            const response = await GetTimingsApi({ params, body: {} })
            if (response) {
                this.timings = response.data.data
                return true;
            }

        } catch (error) {
            return false;
        }
    }

    // Create service
    async TestCreateService() {
        try {
            const type = this.service_types.find((type) => (!type.is_equipment_based && !type.marketplace_hided, !type?.need_certification))
            const payload = {
                "description": "Automation Qa Description ",
                "duration_min": 60,
                "duration_text": "1 h",
                "employees": [{ "employee_id": this.employee.id, "price": "300" }],
                "name": "Automation Qa Service Title",
                "price": "300",
                "service_type_ids": [type.id],
                "special_price": 0,
                "room_id": null
            }

            const formData = new FormData();
            formData.append('req_body', JSON.stringify(payload))

            const created = await CreateService({ METHOD: "POST", API: 'api/v1/store/service', formData })
            if (created) {
                this.service = created.data.data
                return true
            }
        } catch (error) {
            return false
        }
    }

    // get service group
    async TestGetServGrp() {
        const response = await GetServiceGroup()
        if (response) {
            this.service_group = response.data.data
                .filter(group => group.services && group.services.length > 0)
                .flatMap(group => {
                    const { services, ...groupDetails } = group;
                    return services.map(service => ({
                        ...service,
                        group_id: group.id,
                        group_name: group.group,
                        group_sequence: group.sequence,
                        group_marketplace_hidden: group.marketplace_hidden
                    }));
                });
            return true;
        } else {
            return false
        }
    }

    // Create booking 
    async TestCreateBooking() {
        try {
            const body = {
                "customer_name": this.customer.name,
                "customer_phone_number": this.customer.phone_number,
                "booking_date": moment().format('YYYY-MM-DD'),
                "note": "Automation Qa Booking Note",
                "send_email": false,
                "send_sms": false,
                "walk_in": false,
                "created_by_emp_id": this.employee.id,
                "created_by_emp_name": this.employee?.name,
                "services": [{ "service_id": this.service?.id, "time_slot": this.timings[0], "employee_id": this.employee?.id, "duration": 60, "total_amount": "4444", "booking_id": null }]
            }
            // const created = await 

            const created = await CreateBookingApi({ isEdit: false, body })
            if (created) {
                this.booking = created.data.data
                return true
            }
        } catch (error) {
            return false
        }
    }

    // delete booking 
    async TestDeleteBooking() {
        try {
            const deleted = await DeleteBookingApi({ body: { id: this.booking?.bookings[0]?.id }, soft_delete: false })
            if (deleted) {
                return true
            }
        } catch (error) {
            return false
        }
    }

    // delete service 
    async TestDeleteService() {
        try {
            const deleted = await DeleteService({ isGroup: false, id: this.service?.id, soft_delete: false })
            if (deleted) {
                return true
            }
        } catch (error) {
            return false
        }
    }

    // delete customer
    async TestDeleteCustomer() {
        try {
            const deleted = await DeleteCustomerApi(this.customer.id, false)
            if (deleted) {
                return true
            }
        } catch (error) {
            return false
        }
    }

    // delete employee
    async TestDeleteEmployee() {
        try {
            if (!this.employee?.id) {
                return false;
            }
            const deleted = await DeleteEmployeeApi({ id: this.employee.id, soft_delete: false })
            if (deleted) {
                return true
            }
        } catch (error) {
            return false
        }
    }


    // reset
    async TestReset() {
        access_token = null;
        this.token = null;
        this.store = null;
        this.service_group = null;
        this.service_types = null;
        this.customer = null;
        this.service = null;
        this.employee = null;
        this.timings = null;
        this.booking = null;
    }
}