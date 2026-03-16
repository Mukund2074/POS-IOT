import {
    GetApiBundleOffersCodeBundleOfferCode200,
    GetApiCustomers200CustomersItemBundleOffersItem,
} from '@/shared/api/models';
import { CartOverride } from '@/types/CartContext.type';
import { t } from 'i18next';
import moment from 'moment';
import { calculatedData, ErrorOrWarning, SummaryItem } from '../Types/punch-card-sale.types';

export class PunchCardHandlersForSales {
    punchCardData: GetApiBundleOffersCodeBundleOfferCode200 | null;
    cart: CartOverride;
    setAlertMessage: (msg: { severity: 'info' | 'error'; message: string }) => void;
    offersList: GetApiCustomers200CustomersItemBundleOffersItem[] | null;

    summary: calculatedData | null = null;

    // # constructor for PunchCardHandlers [ punchCardData, cart, setAlertMessage ]
    constructor(
        punchCardData: GetApiBundleOffersCodeBundleOfferCode200 | null,
        cart: CartOverride,
        setAlertMessage: (msg: { severity: 'info' | 'error'; message: string }) => void,
        offersList: GetApiCustomers200CustomersItemBundleOffersItem[] | null = null,
    ) {
        this.punchCardData = punchCardData;
        this.cart = cart;
        this.setAlertMessage = setAlertMessage;
        this.offersList = offersList;
    }

    // # method 1 : UPDATE THE PUNCHCARD DATA
    async updatePunchCardData(newData: GetApiBundleOffersCodeBundleOfferCode200 | null) {
        this.punchCardData = newData;
    }

    // # method 2 : PREPARE PUNCHCARD SUMMARY
    async preparePunchCardSummary() {
        if (!this.punchCardData || !this.cart) {
            this.setAlertMessage({ severity: 'error', message: t('Missing data') });
            return;
        }

        const { bundleOffer, soldBundleOffer } = this.punchCardData;

        const cartServices = this.cart?.items?.filter((item: any) => item.itemType === 'SERVICE') || [];

        if (cartServices.length === 0) {
            this.setAlertMessage({ severity: 'error', message: t('No services in cart') });
            return;
        }

        // 1) expiry check
        const expiryDate = moment(soldBundleOffer?.expiryDate);
        if (expiryDate < moment()) {
            this.setAlertMessage({
                severity: 'error',
                message: t('PunchCard.ExpiredPunchCard'),
            });
            return;
        }

        // 2) bundle services map
        const punchCardServices: Record<string, { residue: number }> | null =
            (soldBundleOffer?.services?.services as any) || null;

        const summary: SummaryItem[] = [];
        const errors: ErrorOrWarning[] = [];
        const warnings: ErrorOrWarning[] = [];

        const succeededItems: SummaryItem[] = [];
        const failedItems: SummaryItem[] = [];

        let totalAmount = 0;
        let totalCoveredByPunch = 0;
        let totalRemaining = 0;

        // ✅ residue logic based on bundle type
        let residueQty: number = 0;

        if (bundleOffer?.bundleOfferType === 'PUNCH_BASED') {
            residueQty = soldBundleOffer?.residuePunches ?? 0;
        }

        cartServices.forEach((cartItem: any) => {
            const { serviceId, quantity, amount, itemName } = cartItem;
            const unitAmount = Number(amount ?? 0);

            if (!serviceId || !itemName) {
                errors.push({
                    serviceId: serviceId || 'Unknown',
                    itemName: itemName || 'Unknown',
                    quantity,
                    residueQty: 0,
                    message: `Service "${itemName || 'Unknown'}" is missing required information ❌`,
                });
                return;
            }

            const key = String(serviceId);
            if (bundleOffer?.bundleOfferType === 'SERVICE_BASED') {
                residueQty = punchCardServices?.[key]?.residue ?? 0;
            }

            if (
                bundleOffer?.bundleOfferType === 'SERVICE_BASED' &&
                punchCardServices &&
                !Object.prototype.hasOwnProperty.call(punchCardServices, key)
            ) {
                // Not in bundle at all (only applies when SERVICE_BASED and services list exists)
                errors.push({
                    serviceId,
                    itemName,
                    quantity,
                    residueQty: 0,
                    message: `Service "${itemName}" is not included in the bundle ❌`,
                });

                failedItems.push({
                    serviceId,
                    serviceName: itemName,
                    cartQty: quantity,
                    residueQty: 0,
                    amount: unitAmount,
                    coveredByPunch: 0,
                    extraToPay: quantity,
                });

                totalAmount += unitAmount * quantity;
                totalRemaining += unitAmount * quantity;
                return;
            }

            // split into covered vs extra
            const coveredByPunch = Math.min(quantity, residueQty);
            const extraToPay = Math.max(0, quantity - residueQty);
            if (extraToPay > 0) {
                warnings.push({
                    serviceId,
                    itemName,
                    quantity,
                    residueQty,
                    message: `Service "${itemName}" has insufficient punches. Extra to pay: ${extraToPay} punch(es).`,
                    extraQty: extraToPay,
                });
            }

            // summary (full line)
            summary.push({
                serviceId,
                serviceName: itemName,
                cartQty: quantity,
                residueQty,
                amount: unitAmount,
                coveredByPunch,
                extraToPay,
            });

            // succeeded part
            if (coveredByPunch > 0) {
                succeededItems.push({
                    serviceId,
                    serviceName: itemName,
                    cartQty: coveredByPunch,
                    residueQty,
                    amount: unitAmount,
                    coveredByPunch,
                    extraToPay: 0,
                });
                residueQty = residueQty - coveredByPunch;
                totalCoveredByPunch += unitAmount * coveredByPunch;
            }

            // failed part
            if (extraToPay > 0) {
                failedItems.push({
                    serviceId,
                    serviceName: itemName,
                    cartQty: extraToPay,
                    residueQty,
                    amount: unitAmount,
                    coveredByPunch: 0,
                    extraToPay,
                });
                totalRemaining += unitAmount * extraToPay;
            }

            totalAmount += unitAmount * quantity;
        });

        if (succeededItems?.length === 0) {
            this.setAlertMessage({ severity: 'error', message: t('PunchCard.NoValidPunches') });
            return;
        }
        const data = {
            errors,
            warnings,
            summary,
            succeededItems,
            failedItems,
            totals: {
                totalAmount,
                totalCoveredByPunch,
                totalRemaining,
            },
        };
        this.summary = data;

        return { success: true, data };
    }
}
