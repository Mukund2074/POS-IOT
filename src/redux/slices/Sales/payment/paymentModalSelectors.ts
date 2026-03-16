// Import store to infer RootState type
// eslint-disable-next-line @typescript-eslint/no-var-requires
const store = require('@/context/store').default;
type RootState = ReturnType<typeof store.getState>;

// Modal visibility selectors
export const selectShowSummary = (state: RootState) => state.paymentModal.showSummary;
export const selectShowGiftCardModal = (state: RootState) => state.paymentModal.showGiftCardModal;
export const selectShowMobilePayModal = (state: RootState) => state.paymentModal.showMobilePayModal;
export const selectShowPunchCardModal = (state: RootState) => state.paymentModal.showPunchCardModal;
export const selectShowBonusConfirmationModal = (state: RootState) => state.paymentModal.showBonusConfirmationModal;

// Card terminal selectors
export const selectIsCardTerminalProcessing = (state: RootState) => state.paymentModal.isCardTerminalProcessing;
export const selectCardTerminalLoadingModal = (state: RootState) => state.paymentModal.cardTerminalLoadingModal;
export const selectTerminalPaymentResponse = (state: RootState) => state.paymentModal.terminalPaymentResponse;
export const selectTerminalPaymentAmount = (state: RootState) => state.paymentModal.terminalPaymentAmount;
export const selectIsCancelLoading = (state: RootState) => state.paymentModal.isCancelLoading;

// Gift card selectors
export const selectActiveGiftCards = (state: RootState) => state.paymentModal.activeGiftCards;

// Mobile pay selectors
export const selectMobilepayReference = (state: RootState) => state.paymentModal.mobilepayRefrence;

// Bonus payment selectors
export const selectPendingBonusPayment = (state: RootState) => state.paymentModal.pendingBonusPayment;

// UI state selectors
export const selectShouldDirectPay = (state: RootState) => state.paymentModal.shouldDirectPay;
export const selectSelectedTab = (state: RootState) => state.paymentModal.selectedTab;
