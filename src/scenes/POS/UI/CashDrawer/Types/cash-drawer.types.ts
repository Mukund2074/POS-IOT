import { GetApiCashDrawerEmployeeSummary200Data } from '@/shared/api/models/getApiCashDrawerEmployeeSummary200Data';

export type CashFormType = {
    key: number;
    label: string;
    val: number;
};

export type CashDrawerData = GetApiCashDrawerEmployeeSummary200Data & {
    bankTransformForm: CashFormType[];
    CashDifferenceForm: CashFormType[];
    transferToBank: number;
    addNoteToVoteCheck: boolean;
    addNoteToVote: string;
    cardDifference: number;
    bankDifference: number;
    bankTransferTotal: number;
    remainingCashForNextDay: number;
    selectedEmployee: number;
};
