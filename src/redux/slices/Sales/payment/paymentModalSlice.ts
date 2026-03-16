import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PaymentMethod } from '@/scenes/POS/UI/Sales-Page/Types/sales.types';
import { GetApiCustomers200CustomersItemGiftCardsItem } from '@/shared/api/models';

interface PaymentModalState {
    // Modal visibility states
    showSummary: boolean;
    showGiftCardModal: boolean;
    showMobilePayModal: boolean;
    showPunchCardModal: boolean;
    showBonusConfirmationModal: boolean;

    // Card terminal state
    isCardTerminalProcessing: boolean;
    cardTerminalLoadingModal: {
        open: boolean;
        status: 'processing' | 'success' | 'error';
        message?: string;
    };
    terminalPaymentResponse: any;
    terminalPaymentAmount: number;
    isCancelLoading: boolean;

    // Gift card state
    activeGiftCards: GetApiCustomers200CustomersItemGiftCardsItem[];

    // Mobile pay state
    mobilepayRefrence: string;

    // Bonus payment state
    pendingBonusPayment: {
        method: PaymentMethod;
        amount: number;
        mobileByPass?: boolean;
        referenceId?: string | null;
    } | null;

    // UI state
    shouldDirectPay: boolean;
    selectedTab: 'payment' | 'refund';
}

const initialState: PaymentModalState = {
    showSummary: false,
    showGiftCardModal: false,
    showMobilePayModal: false,
    showPunchCardModal: false,
    showBonusConfirmationModal: false,
    isCardTerminalProcessing: false,
    cardTerminalLoadingModal: {
        open: false,
        status: 'processing',
    },
    terminalPaymentResponse: null,
    terminalPaymentAmount: 0,
    isCancelLoading: false,
    activeGiftCards: [],
    mobilepayRefrence: '',
    pendingBonusPayment: null,
    shouldDirectPay: false,
    selectedTab: 'payment',
};

const paymentModalSlice = createSlice({
    name: 'paymentModal',
    initialState,
    reducers: {
        // Modal visibility
        setShowSummary: (state, action: PayloadAction<boolean>) => {
            state.showSummary = action.payload;
        },
        setShowGiftCardModal: (state, action: PayloadAction<boolean>) => {
            state.showGiftCardModal = action.payload;
        },
        setShowMobilePayModal: (state, action: PayloadAction<boolean>) => {
            state.showMobilePayModal = action.payload;
        },
        setShowPunchCardModal: (state, action: PayloadAction<boolean>) => {
            state.showPunchCardModal = action.payload;
        },
        setShowBonusConfirmationModal: (state, action: PayloadAction<boolean>) => {
            state.showBonusConfirmationModal = action.payload;
        },

        // Card terminal
        setIsCardTerminalProcessing: (state, action: PayloadAction<boolean>) => {
            state.isCardTerminalProcessing = action.payload;
        },
        setCardTerminalLoadingModal: (
            state,
            action: PayloadAction<{
                open: boolean;
                status: 'processing' | 'success' | 'error';
                message?: string;
            }>,
        ) => {
            state.cardTerminalLoadingModal = action.payload;
        },
        setTerminalPaymentResponse: (state, action: PayloadAction<any>) => {
            state.terminalPaymentResponse = action.payload;
        },
        setTerminalPaymentAmount: (state, action: PayloadAction<number>) => {
            state.terminalPaymentAmount = action.payload;
        },
        setIsCancelLoading: (state, action: PayloadAction<boolean>) => {
            state.isCancelLoading = action.payload;
        },

        // Gift cards
        setActiveGiftCards: (state, action: PayloadAction<GetApiCustomers200CustomersItemGiftCardsItem[]>) => {
            state.activeGiftCards = action.payload;
        },

        // Mobile pay
        setMobilepayReference: (state, action: PayloadAction<string>) => {
            state.mobilepayRefrence = action.payload;
        },

        // Bonus payment
        setPendingBonusPayment: (
            state,
            action: PayloadAction<{
                method: PaymentMethod;
                amount: number;
                mobileByPass?: boolean;
                referenceId?: string | null;
            } | null>,
        ) => {
            state.pendingBonusPayment = action.payload;
        },

        // UI state
        setShouldDirectPay: (state, action: PayloadAction<boolean>) => {
            state.shouldDirectPay = action.payload;
        },
        setSelectedTab: (state, action: PayloadAction<'payment' | 'refund'>) => {
            state.selectedTab = action.payload;
        },

        // Reset all state
        resetPaymentModal: (state) => {
            return initialState;
        },
    },
});

export const {
    setShowSummary,
    setShowGiftCardModal,
    setShowMobilePayModal,
    setShowPunchCardModal,
    setShowBonusConfirmationModal,
    setIsCardTerminalProcessing,
    setCardTerminalLoadingModal,
    setTerminalPaymentResponse,
    setTerminalPaymentAmount,
    setIsCancelLoading,
    setActiveGiftCards,
    setMobilepayReference,
    setPendingBonusPayment,
    setShouldDirectPay,
    setSelectedTab,
    resetPaymentModal,
} = paymentModalSlice.actions;

export default paymentModalSlice.reducer;
