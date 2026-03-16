import { SelectChangeEvent } from "@mui/material"

export type GiftCardHeaderProps = {
    handleSelectGiftCard: (e: SelectChangeEvent<string | number | (string | number)[] | null>) => void;
    selectedGiftCard: string;
    handleSearchChange: React.ChangeEventHandler<HTMLInputElement>;
    searchTerm: string;
    setSelectedSources: (e : string) => void;
    selectedSources : string
};

export type GiftCardBodyProps = {
    giftCardData: any;
    isFetching: boolean;
};
