import { useEffect, useState } from 'react';
import GiftCardHeader from './UI/GiftCardHeader';
import { SelectChangeEvent } from '@mui/material';
import { useGetGiftCards } from '@/hooks/api/giftCard';
import { GetApiGiftCards200ItemsItem, GetApiGiftCardsSource, GetApiGiftCardsStatus } from '@/shared/api/models';
import { useDebounce } from '@/hooks/shared';
import GiftCardBody from './UI/GiftCardBody';
import Permission, { PermissionDenied } from '@/utils/POS/Permission';

const GiftCardPageLayout = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [selectedGiftCard, setSelectedGiftCard] = useState('ALL');
    const [selectedSources, setSelectedSources] = useState('ALL');
    const [giftCardData, setGiftCardData] = useState<GetApiGiftCards200ItemsItem[]>([]);
    const { isAllowed } = Permission();
    const { data: giftCardSearch, isFetching } = useGetGiftCards({
        params: {
            page: 1,
            limit: 10000,
            keyword: debouncedSearchTerm || undefined,
            status: (selectedGiftCard as GetApiGiftCardsStatus) || undefined,
            source : selectedSources as GetApiGiftCardsSource
        },
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSelectGiftCard = (e: SelectChangeEvent<string | number | (string | number)[] | null>) => {
        const value = e.target.value;
        setSelectedGiftCard(value as string);
    };

    useEffect(() => {
        if (giftCardSearch?.items) {
            setGiftCardData(giftCardSearch.items);
        }
    }, [giftCardSearch]);

    return (
        <>
            <GiftCardHeader
                handleSelectGiftCard={handleSelectGiftCard}
                selectedGiftCard={selectedGiftCard}
                handleSearchChange={handleSearchChange}
                searchTerm={searchTerm}
                setSelectedSources={setSelectedSources}
                selectedSources={selectedSources}
            />

            {isAllowed('GiftCard', 'read') ? (
                <GiftCardBody giftCardData={giftCardData} isFetching={isFetching} />
            ) : (
                <PermissionDenied />
            )}
        </>
    );
};

export default GiftCardPageLayout;
