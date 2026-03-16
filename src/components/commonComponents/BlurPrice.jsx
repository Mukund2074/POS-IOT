import React from 'react';
import { useSelector } from 'react-redux';
import { shouldBlurPrices } from '@/utils/price-visibility';

const BlurPrice = ({ children }) => {
    const user = useSelector((state) => state.user.data);
    const blur = shouldBlurPrices(user);

    if (!blur) {
        return children;
    }

    return (
        <span
            style={{
                filter: 'blur(6px)',
                pointerEvents: 'none',
                userSelect: 'none',
            }}
        >
            {children}
        </span>
    );
};

export default BlurPrice;
