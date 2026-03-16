import { HttpStatusCode } from 'axios';
import { t } from 'i18next';
import moment from 'moment';
import { api } from '../../../../utils/Api/POS/index';

export class BookingDetailsApi {
    static api = null;
    static apiFetcher = null;
    static bookingId = null;
    static toast = null;
    static bookingDetails = null;
    static salesDetails = null;
    static navigate = null;
    static closeForm = null;
    static saleResponseId = null;
    static noShowSettings = null;
    static settings = null;
    static refetchSalesDetails = () => {};
    static taxList = [];
    constructor({
        apiFetcher,
        bookingId,
        toast,
        closeForm,
        salesDetails,
        navigate,
        bookingDetails,
        noShowSettings,
        settings,
        refetchSalesDetails,
        taxList,
    }) {
        this.apiFetcher = apiFetcher;
        this.bookingId = bookingId;
        this.toast = toast;
        this.closeForm = closeForm;
        this.salesDetails = salesDetails;
        this.navigate = navigate;
        this.bookingDetails = bookingDetails;
        this.saleResponseId = null;
        this.noShowSettings = noShowSettings;
        this.settings = settings;
        this.refetchSalesDetails = refetchSalesDetails;
        this.taxList = taxList;
    }

    // #method 1 : Get Booking Details By ID
    async getDetails({ setBookingDetails, setStatus, setLoading, settings }) {
        try {
            const response = await this?.apiFetcher(
                `api/v1/store/booking/${this.bookingId}?all_in_group_bookings=true`,
            );
            if (response.status === HttpStatusCode.Ok) {
                setBookingDetails(response?.data?.data);
                if (response?.data?.data?.booking?.custom_status_id) {
                    const matchcolor = settings?.profile.custom_statuses?.filter((val) => {
                        if (response?.data?.data?.booking?.custom_status_id === val.id) {
                            return val.status_color;
                        }
                    });
                    if (matchcolor.length > 0) {
                        setStatus(response?.data?.data?.booking?.custom_status_id);
                    } else {
                        setStatus(response?.data?.data?.booking?.status);
                    }
                } else {
                    setStatus(response?.data?.data?.booking?.status);
                }
            }

            if (response?.data?.data?.booking?.sales_id) {
                this?.refetchSalesDetails(response?.data?.data?.booking?.sales_id);
            }
        } catch (error) {
            this?.toast.error(t('History.FetchErr'));
        } finally {
            setLoading(false);
        }
    }

    // #method 2 : Update Booking Status
    async updateBookingStatus({ status, admin_charge_cancellation = false, showToast = true }) {
        if (!this.bookingDetails?.booking?.id) {
            this?.toast.error(t('Calendar.ToastErrIdMissing'));
            return false;
        }

        const payload = { id: this.bookingDetails?.booking?.id, custom_status_id: null };
        let endpoint = '';

        switch (status) {
            case 'COMPLETED':
                endpoint = `api/v1/store/booking/complete`;
                break;
            case 'CANCELLED':
                endpoint = `api/v1/store/booking/cancel`;
                payload.admin_charge_cancellation = admin_charge_cancellation;
                break;
            case 'BOOKED':
                endpoint = `api/v1/store/booking/pending`;
                break;
            case 'NOSHOW':
                endpoint = `api/v1/store/booking/noshow`;
                break;
            case 'DELETED':
                endpoint = `api/v1/store/booking/delete`;
                break;
            case 'RESCHEDULED':
                endpoint = `api/v1/store/booking/reschedule`;
                payload.booking_date = moment(this?.bookingDetails?.booking?.booking_datetime_start).format(
                    'YYYY-MM-DD',
                );
                payload.time_slot = `${moment(this?.bookingDetails?.booking?.booking_datetime_start).format('HH:mm')} - ${moment(this?.bookingDetails?.booking?.booking_datetime_end).format('HH:mm')}`;
                payload.employee_id = this?.bookingDetails?.booking?.employee_id;
                payload.total_amount = this?.bookingDetails?.booking?.booking_details?.price;
                break;
            default:
                endpoint = `/api/v1/store/booking/pending`;
                payload.custom_status_id = status;
            // return false;
        }

        try {
            const response = await this?.apiFetcher.post(endpoint, { ...payload, google_calendar_sync: true });
            if (response.data.success) {
                if (showToast) {
                    this.toast.success(response.data.msg || t('Calendar.ToastSuccessStatus'));
                }
                if (status === 'NOSHOW' && !this?.noShowSettings?.enable) {
                    this?.closeForm();
                    return;
                }
                this?.closeForm();
                return true;
            } else {
                if (showToast) {
                    this.toast.error(response.data.msg || t('Calendar.ToastErrStatus'));
                }
                return false;
            }
        } catch (error) {
            return false;
        }
    }

    // #Method 3 : Handle Email Send , SMS Send By type
    async handleSend({ type }) {
        let param = type === 'SMS' ? 'send-sms' : 'send-email';

        try {
            const response = await this?.apiFetcher.post(`api/v1/store/booking/${param}/${this?.bookingId}`);
            if (response.data.success) {
                this?.toast.success(
                    param === 'send-sms' ? t('Calendar.SendSmsSuccess') : t('Calendar.SendEmailSuccess'),
                );
                this?.getDetails();
            }
        } catch (error) {
            this?.toast.error(param === 'send-sms' ? t('Calendar.SendSmsError') : t('Calendar.SendEmailError'));
        }
    }

    // #Method 4 : Handle Payment
    async handlePayment({ addRefundItem, setCart, addItem, isOutstandingPayment = false, remainingAmount = 0 }) {
        const isPOSActive = this?.settings?.profile?.outlet_addons?.some((addon) => addon.addon_name === 'POS');
        if (!isPOSActive) {
            return;
        }

        const serviceTax = this?.taxList?.data?.find(
            (tax) =>
                tax?.isActive &&
                tax?.applyTaxTo === 'ALL_ITEMS_SERVICES' &&
                tax?.includeTaxInItemPrice === true &&
                tax?.taxName === 'VAT',
        );

        // amount: 300;
        // discount: 0;
        // discountAmount: 0;
        // discounts: [];
        // employeeId: 988;
        // itemName: 'Udestående';
        // itemType: 'OUTSTANDING';
        // price: '300.00';
        // productId: null;
        // quantity: 1;
        // saleType: 'SALE';
        // serviceId: null;
        // subTotal: 300;
        // tax: [];
        // taxAmount: 0;
        // taxes: [];
        // taxs: [];
        const outstandingItem = {
            productId: null,
            serviceId: null,
            itemName: t('POS.Outstanding'),
            itemType: 'OUTSTANDING',
            saleType: 'SALE',
            quantity: 1,
            amount: remainingAmount.toFixed(2) ?? 0,
            discount: 0,
            discountAmount: 0,
            taxAmount: 0,
            price: remainingAmount.toFixed(2) ?? 0,
            note: 'Outstanding Payment',
            employeeId: Number(localStorage.getItem('employee_id')),
            description: 'Outstanding Payment',
            discounts: [],
            discountType: 'VARIABLE_PERCENTAGE', // Default discount type
            tax: serviceTax ? [serviceTax] : [],
            subTotal: remainingAmount.toFixed(2) ?? 0,
        };

        if (this?.bookingDetails?.booking?.sales_id) {
            this?.salesDetails?.items?.forEach((item) => {
                const newItem = {
                    // ...item,
                    salesDetailId: item?.id,
                    productId: item.productId,
                    serviceId: item.serviceId,
                    itemName: this?.bookingDetails?.booking?.service?.isSpecial
                        ? `${this?.bookingDetails?.booking?.service?.isSpecial} (${t('SpOffers.SpOffer')})`
                        : item.itemName || '',
                    itemType: item.itemType != null ? item.itemType : 'PRODUCT',
                    saleType: item.saleType != null ? item.saleType : 'SALE',
                    quantity: item.quantity ?? 1,
                    amount: Number(item.amount) ?? 0,
                    discountAmount: Number(item.discountAmount) ?? 0,
                    taxAmount: Number(item.taxAmount) ?? 0,
                    price: Number(item.price) ?? 0,
                    note: item.note || '',
                    employeeId: item.employeeId || Number(localStorage.getItem('employee_id')),
                    description: item.description || '',
                    discounts:
                        item.discounts?.map((discount) => ({
                            discountAmount: Number(discount.discountAmount) ?? 0,
                            amountType: discount.amountType || 'VARIABLE_PERCENTAGE',
                            amount: Number(discount.amount) ?? 0,
                        })) || [],
                    discountType: 'VARIABLE_PERCENTAGE', // Default discount type
                    tax: item.tax || (serviceTax && item.itemType === 'SERVICE') ? [serviceTax] : [],
                };

                // Determine if it's a refund item based on amount or saleType
                if (newItem.amount < 0 || newItem.saleType === 'RETURN') {
                    addRefundItem(newItem);
                } else {
                    addItem(newItem);
                }
            });
            if (isOutstandingPayment && remainingAmount > 0) {
                addItem(outstandingItem);
            }
        } else {
            const newMainService = {
                productId: null,
                serviceId: this?.bookingDetails?.booking?.service_id,
                itemName: this?.bookingDetails?.booking?.service?.is_special
                    ? `${this?.bookingDetails?.booking?.booking_details?.service_name} (${t('SpOffers.SpOffer')})`
                    : this?.bookingDetails?.booking?.booking_details?.service_name || '',
                itemType: 'SERVICE',
                saleType: 'SALE',
                quantity: 1,
                amount: Number(this?.bookingDetails?.booking?.booking_details?.price) ?? 0,
                discountAmount: 0,
                taxAmount: 0,
                price: Number(this?.bookingDetails?.booking?.booking_details?.price) ?? 0,
                note: '',
                employeeId: this?.bookingDetails?.booking?.booking_details?.employee_id || '',
                description: '',
                discounts: [],
                discountType: 'VARIABLE_PERCENTAGE', // Default discount type
                bookingId: this?.bookingId,
                saleId: this?.bookingDetails?.booking?.sales_id || null,
                tax: serviceTax ? [serviceTax] : [],
            };
            addItem(newMainService);

            if (this?.bookingDetails?.group_bookings && this?.bookingDetails?.group_bookings?.length > 0) {
                this?.bookingDetails?.group_bookings?.map((booking) => {
                    const newGroupService = {
                        productId: null,
                        serviceId: booking?.booking_details?.service_id,
                        itemName: this.bookingDetails?.booking?.service?.is_special
                            ? `${booking?.booking_details?.service_name} (${t('SpOffers.SpOffer')})`
                            : booking?.booking_details?.service_name || '',
                        itemType: 'SERVICE',
                        saleType: 'SALE',
                        quantity: 1,
                        amount: Number(booking?.booking_details?.price) ?? 0,
                        discountAmount: 0,
                        taxAmount: 0,
                        price: Number(booking?.booking_details?.price) ?? 0,
                        note: '',
                        employeeId: booking?.booking_details?.employee_id || '',
                        description: '',
                        discounts: [],
                        discountType: 'VARIABLE_PERCENTAGE', // Default discount type
                        bookingId: booking?.id,
                        saleId: this?.bookingDetails?.booking?.sales_id || null,
                        tax: serviceTax ? [serviceTax] : [],
                    };
                    addItem(newGroupService);
                });
            }

            if (isOutstandingPayment && remainingAmount > 0) {
                addItem(outstandingItem);
            }
        }
        setCart((prevCart) => ({
            ...prevCart,
            customerId: this?.bookingDetails?.booking?.outlet_customer?.id || null,
            customerName: this?.bookingDetails?.booking?.outlet_customer?.name || null,
            salesDate: moment().format('YYYY-MM-DD HH:mm:ss'),
            sellBy: Number(localStorage.getItem('employee_id')),
            salesType: 'SALES',
            paidAmount: this?.salesDetails?.netTotal,
            saleId: this?.bookingDetails?.booking?.sales_id || null,
        }));

        this?.closeForm();
        this?.navigate('/pos/sales?sellGiftCard=true');
    }

    // #method 5 : DELETE Booking
    async confirmDeleteBooking({ setShowDeleteConfirmation }) {
        const result = await this.updateBookingStatus({ status: 'DELETED' });
        if (result) {
            setShowDeleteConfirmation(false);
            this?.closeForm();
        }
    }

    // #method 6 : Cancel Booking
    async confirmCancelBooking({ setShowCancelConfirmation, admin_charge_cancellation = false }) {
        const result = await this.updateBookingStatus({ status: 'CANCELLED', admin_charge_cancellation });
        if (result) {
            setShowCancelConfirmation(false);
            this.closeForm();
        }
    }

    // # METHOD 7: Sell the service list as outstanding payment
    async handleSellAsOutstanding({ payload }) {
        try {
            const response = await api?.postApiSale(payload);
            if (response) {
                this.saleResponseId = response?.data?.id;
                this?.refetchSalesDetails(this?.saleResponseId || response?.data?.id);
            }
        } catch (error) {
            console.error('Error selling as outstanding payment:', error);
            // this?.toast.error('something went wrong');
        }
    }

    // #METHOD 8: Sell the service list as outstanding payment
    async noShowDetailsUpdate({ payload }) {
        try {
            await api?.patchApiBookingsNoShowId(this?.bookingId, payload);
        } catch (error) {
            console.error('Error selling as outstanding payment:', error);
            this?.toast.error('something went wrong');
        }
    }

    // #METHOD 9: Delete Group Booking
    async confirmDeleteGroupBooking({ setShowDeleteConfirmation, payload }) {
        const formPayload = { ...(payload ?? {}), google_calendar_sync: true };
        try {
            const result = await this.apiFetcher.post('/api/v1/store/booking/delete-bulk', formPayload);
            if (result) {
                this?.toast.success(t('Calendar.ToastSuccessDeleteBooking'));
                setShowDeleteConfirmation(false);
                this.closeForm();
            }
        } catch (error) {
            console.error('Error deleting group booking:', error);
            this?.toast.error(t('Calendar.ToastErrDeleteBooking'));
        }
    }

    // #METHOD 10: Bulk Cancel Bookings
    async bulkCancelBookings({ payload, setShowBulkConfirmation }) {
        const formPayload = { ...(payload ?? {}), google_calendar_sync: true };
        try {
            const response = await this.apiFetcher.post('api/v1/store/booking/cancel-bulk', formPayload);

            if (response.data.success) {
                this?.toast.success(response.data.msg || t('Calendar.ToastSuccessBulkCancel'));
                if (setShowBulkConfirmation) {
                    setShowBulkConfirmation(false);
                }
                this?.closeForm();
                return true;
            } else {
                this?.toast.error(response.data.msg || t('Calendar.ToastErrBulkCancel'));
                return false;
            }
        } catch (error) {
            console.error('Error bulk cancelling bookings:', error);
            this?.toast.error(t('Calendar.ToastErrBulkCancel'));
            return false;
        }
    }

    // #METHOD 11: Bulk Pending Bookings
    async bulkPendingBookings({ payload, setShowBulkConfirmation }) {
        const formPayload = { ...(payload ?? {}), google_calendar_sync: true };
        try {
            const response = await this.apiFetcher.post('api/v1/store/booking/pending-bulk', formPayload);

            if (response.data.success) {
                this?.toast.success(response.data.msg || t('Calendar.ToastSuccessBulkPending'));
                if (setShowBulkConfirmation) {
                    setShowBulkConfirmation(false);
                }
                this?.closeForm();
                return true;
            } else {
                this?.toast.error(response.data.msg || t('Calendar.ToastErrBulkPending'));
                return false;
            }
        } catch (error) {
            console.error('Error bulk pending bookings:', error);
            this?.toast.error(t('Calendar.ToastErrBulkPending'));
            return false;
        }
    }

    // #METHOD 12: Bulk Complete Bookings
    async bulkCompleteBookings({ payload, setShowBulkConfirmation }) {
        const formPayload = { ...(payload ?? {}), google_calendar_sync: true };
        try {
            const response = await this.apiFetcher.post('api/v1/store/booking/complete-bulk', formPayload);

            if (response.data.success) {
                this?.toast.success(response.data.msg || t('Calendar.ToastSuccessBulkComplete'));
                if (setShowBulkConfirmation) {
                    setShowBulkConfirmation(false);
                }
                this?.closeForm();
                return true;
            } else {
                this?.toast.error(response.data.msg || t('Calendar.ToastErrBulkComplete'));
                return false;
            }
        } catch (error) {
            console.error('Error bulk completing bookings:', error);
            this?.toast.error(t('Calendar.ToastErrBulkComplete'));
            return false;
        }
    }

    // #METHOD 13: Bulk No-Show Bookings
    async bulkNoShowBookings({ payload, setShowBulkConfirmation }) {
        const formPayload = { ...(payload ?? {}), google_calendar_sync: true };
        try {
            const response = await this.apiFetcher.post('api/v1/store/booking/noshow-bulk', formPayload);

            if (response.data.success) {
                this?.toast.success(response.data.msg || t('Calendar.ToastSuccessBulkNoShow'));
                if (setShowBulkConfirmation) {
                    setShowBulkConfirmation(false);
                }
                this?.closeForm();
                return true;
            } else {
                this?.toast.error(response.data.msg || t('Calendar.ToastErrBulkNoShow'));
                return false;
            }
        } catch (error) {
            console.error('Error bulk no-show bookings:', error);
            this?.toast.error(t('Calendar.ToastErrBulkNoShow'));
            return false;
        }
    }

    // #METHOD 14: UPDATE DYNAMIC API CONSTRUCTOR
    async updateConstructorValuesApi({ key, value }) {
        if (this[key]) {
            this[key] = value;
        }
    }

    // #METHOD 15: Sync Booking to Google Calendar
    async syncBookingToGoogleCalendar({ payload }) {
        try {
            const response = await this.apiFetcher.post('/api/google-calendar/booking-sync-by-group-uuid', payload);

            if (response.data.success) {
                this?.toast.success(response.data.msg || t('Calendar.ToastSuccessSyncToGoogleCalendar'));

                return true;
            } else {
                this?.toast.error(response.data.msg || t('Calendar.ToastErrSyncToGoogleCalendar'));
                return false;
            }
        } catch (error) {
            console.error('Error syncing booking to Google Calendar:', error);
            this?.toast.error(t('Calendar.ToastErrSyncToGoogleCalendar'));
            return false;
        }
    }

    // #METHOD 16: Sync Booking Status to Google Calendar
    async syncBookingStatusToGoogleCalendar({ payload }) {
        try {
            const response = await this.apiFetcher.get('/api/google-calendar/booking-status-by-group-uuid', {
                params: payload,
            });
            return response;
        } catch (error) {
            return error;
        }
    }

    // #METHOD 17: Delete Cancel Booking
    async handleDeleteCancelBooking(refreshBookings) {
        try {
            const response = await this.apiFetcher.delete(
                `/api/v1/store/service/cancellation_offer?booking_id=${this?.bookingDetails?.booking?.id}`,
            );
            if (response) {
                this?.toast.success(t('Calendar.CancellationDeleteMsg'));
                this?.closeForm();
                refreshBookings();
                return true;
            }
        } catch (error) {
            console.error('Error deleting cancel booking:', error);
            this?.toast.error(t('Calendar.ToastErrDeleteCancelBooking'));
            return false;
        }
    }

    // #METHOD 18: promise for 3 api calls (sale as no show + no show details update + update booking status)
}
