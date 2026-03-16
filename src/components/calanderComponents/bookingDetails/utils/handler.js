import { Typography } from '@mui/material';
import { t } from 'i18next';
import moment from 'moment';

export class BookingDetailHandler {
    static apiFetcher = null;
    static bookingId = null;
    static toast = null;
    static settings = null;
    static salesDetails = null;
    static bookingDetails = null;
    static BillingAmount = 0;

    constructor({ apiFetcher, bookingId, toast, settings, salesDetails, bookingDetails, BillingAmount }) {
        this.apiFetcher = apiFetcher;
        this.bookingId = bookingId;
        this.toast = toast;
        this.settings = settings;
        this.salesDetails = salesDetails;
        this.bookingDetails = bookingDetails;
        this.BillingAmount = BillingAmount;
    }

    commonStackStyle = {
        display: 'flex',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        py: 0.5,
        px: 3,
    };

    detailsTextStyle = {
        width: '75%',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        textAlign: 'right',
    };

    commonDevider = {
        borderBottomWidth: 2,
        borderColor: '#D9D9D9',
        mr: 1.5,
        ml: 1.5,
    };

    // # method 1 : Fetch Status
    async FetchStatus({ setstatusarr = () => {}, publicCustomStatuses = [] }) {
        const staticarr = [
            {
                value: 'BOOKED',
                label: (
                    <Typography fontWeight={700} variant="body1">
                        {t('Calendar.Booked')}
                    </Typography>
                ),
                tetxColor: '#A79C92',
            },
            {
                value: 'RESCHEDULED',
                label: (
                    <Typography fontWeight={700} variant="body1">
                        {t('Calendar.Rescheduled')}
                    </Typography>
                ),
                tetxColor: '#A79C92',
            },
            {
                value: 'COMPLETED',
                label: (
                    <Typography fontWeight={700} variant="body1">
                        {t('Common.Completed')}
                    </Typography>
                ),
                tetxColor: '#367B3D',
            },
            {
                value: 'CANCELLED',
                label: (
                    <Typography fontWeight={700} variant="body1">
                        {t('Common.Cancelled')}
                    </Typography>
                ),
                tetxColor: '#C74141',
            },
            {
                value: 'OFFERED',
                label: (
                    <Typography fontWeight={700} variant="body1">
                        {t('Calendar.AwaitNewCus')}
                    </Typography>
                ),
                tetxColor: '#e19957',
            },
        ];
        let resarr = [];
        if (publicCustomStatuses.length > 0) {
            resarr = publicCustomStatuses?.map((val) => ({
                value: val?.id,
                label: (
                    <Typography fontWeight={700} variant="body1">
                        {val?.statusText}
                    </Typography>
                ),
            }));
        } else {
            // no show will be added only if its not public booking
            staticarr.push({
                value: 'NOSHOW',
                label: (
                    <Typography fontWeight={700} variant="body1">
                        {t('Calendar.AbsenceBooking')}
                    </Typography>
                ),
                tetxColor: '#A36437',
            });
            resarr = this?.settings?.profile.custom_statuses?.map((val) => ({
                value: val.id,
                label: (
                    <Typography fontWeight={700} variant="body1">
                        {val.status_text}
                    </Typography>
                ),
                tetxColor: val.status_color,
            }));
        }
        setstatusarr([...staticarr, ...resarr]);
    }

    // # METHOD 2 : Update billing amount

    async updateBillingAmount({ BillingAmount }) {
        this.BillingAmount = BillingAmount;
    }

    // # METHOD 3 : Create Sales Cart Item

    // computed property
    async getFullCart({ customPrice }) {
        const isPOSActive = this?.settings?.profile?.outlet_addons?.some((addon) => addon.addon_name === 'POS');
        if (!isPOSActive) {
            return null;
        }

        const saleId = this?.bookingDetails?.booking?.sales_id || null;
        const cartItems = [];

        // main booking
        cartItems.push({
            productId: null,
            serviceId: this?.bookingDetails?.booking?.service_id,
            itemName: this?.bookingDetails?.booking?.booking_details?.service_name || '',
            itemType: 'SERVICE',
            saleType: 'SALE',
            quantity: 1,
            amount: customPrice ?? this?.BillingAmount ?? 0,
            discountAmount: 0,
            taxAmount: 0,
            price: customPrice ?? this?.BillingAmount ?? 0,
            note: '',
            employeeId: this?.bookingDetails?.booking?.booking_details?.employee_id || '',
            description: '',
            discounts: [],
            discountType: 'VARIABLE_PERCENTAGE',
            bookingId: this?.bookingId,
            saleId,
            tax: [],
        });

        // group bookings
        this?.bookingDetails?.group_bookings?.forEach((booking) => {
            cartItems.push({
                productId: null,
                serviceId: booking?.service_id,
                itemName: booking?.booking_details?.service_name || '',
                itemType: 'SERVICE',
                saleType: 'SALE',
                quantity: 1,
                amount: customPrice ?? this?.BillingAmount ?? 0,
                discountAmount: 0,
                taxAmount: 0,
                price: customPrice ?? this?.BillingAmount ?? 0,
                note: '',
                employeeId: booking?.booking_details?.employee_id || '',
                description: '',
                discounts: [],
                discountType: 'VARIABLE_PERCENTAGE',
                bookingId: booking?.id,
                saleId,
                tax: [],
            });
        });

        // payment

        const paymentItem = [
            {
                amount: customPrice ?? this?.BillingAmount ?? 0,
                paymentType: 'OUTSTANDING',
                tenderAmount: customPrice ?? this?.BillingAmount ?? 0,
                change: 0,
                txStatus: 'SUCCEEDED',
            },
        ];
        // return full cart
        return {
            items: cartItems,
            salesDiscounts: [],
            salesTaxes: [],
            payment: paymentItem,
            customerId: this?.bookingDetails?.booking?.outlet_customer?.id || null,
            customerName: this?.bookingDetails?.booking?.outlet_customer?.name || null,
            salesDate: moment().format('YYYY-MM-DD HH:mm:ss'),
            sellBy: Number(localStorage.getItem('employee_id')),
            salesType: 'SALES',
            saleId,
            subTotal: customPrice ?? this?.BillingAmount ?? 0,
            netTotal: customPrice ?? this?.BillingAmount ?? 0,
            tenderAmount: customPrice ?? this?.BillingAmount ?? 0,
            change: 0,
            roundOff: 0,
            tips: 0,
            totalTax: 0,
            salesNote: '',
            totalDiscount: 0,
        };
    }

    // # METHOD 4 : Update Constructor Values
    async updateConstructorValuesHandler({ key, value }) {
        if (this[key]) {
            this[key] = value;
        }
    }
}
