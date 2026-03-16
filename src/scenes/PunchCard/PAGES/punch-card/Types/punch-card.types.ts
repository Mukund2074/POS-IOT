import { GetApiBundleOffers200ItemsItem } from '@/shared/api/models';

export interface PunchCardTableProps {
    punchCards: GetApiBundleOffers200ItemsItem[];
    isLoading: boolean;
    toast: any;
    asComponent?: boolean;
    onApplyClick?: (row: GetApiBundleOffers200ItemsItem) => void;
}
