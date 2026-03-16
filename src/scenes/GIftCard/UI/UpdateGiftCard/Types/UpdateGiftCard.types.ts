import { FormikProps } from "formik";
import { GetApiGiftCardsId200HistoryItem } from "@/shared/api/models";


type customer = {
    id: number;
    name: string;
}

export type UpdateHistoryProps =  (GetApiGiftCardsId200HistoryItem & { id: string })[]



export type UpdateGiftCardFormValues = {
    customer:customer;
    giftCardAmount: number;
    remainingAmount: number;
    expiryDate: Date | string;
    giftCardCode: string;
    recipientName: string;
    notes: string ;
    history:UpdateHistoryProps;
};
export type UpdateGiftCardHeadertypeProps = {
    status: string,
    isChanges: boolean,
    formik:FormikProps<UpdateGiftCardFormValues>,
    handleUsed: ({ showToast, isUsed }: { showToast?: boolean; isUsed?: boolean }) => void
}


export type UpdateGiftCardTableProps = {
    data:UpdateHistoryProps
};

