import { Grid2 } from '@mui/material';
import React, { useState, memo } from 'react';
import POSInput from '@/components/POS/Common/POSInput';
import PreviousSales from '../Shared/PreviousSales';
import { ItemCard } from '../Shared/ItemCard';

export default memo(function ItemBrowser() {
    const [currentComponent, setCurrentComponent] = useState<number>(1);
    const [search, setSearch] = useState('');

    const handleComponentChange = (component: number) => {
        setCurrentComponent(component);
    };

    const renderComponent = () => {
        switch (currentComponent) {
            case 1:
                return <ItemCard search={search} handleComponentChange={handleComponentChange} />;
            case 2:
                return <PreviousSales handleComponentChange={handleComponentChange} search={search} />;
            default:
                return <ItemCard search={search} handleComponentChange={handleComponentChange} />;
        }
    };

    return (
        <Grid2
            size={{ xs: 12, md: 4 }}
            sx={{
                borderRight: '1px solid #d9d9d9',
                height: { xs: 'auto', md: '100%' },
                overflow: 'hidden',
                pb: 6,
            }}
        >
            <POSInput
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ border: 'none', width: '100%' }}
            />

            {renderComponent()}
        </Grid2>
    );
});
