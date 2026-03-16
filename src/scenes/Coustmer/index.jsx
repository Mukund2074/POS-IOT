import React, { useState } from 'react';
import CustomerListNew from '../../components/customer/indexNew';
import AppbarComponent from '../../components/AppBar';
import { t } from 'i18next';
import { Stack } from '@mui/material';

const CustomerModule = () => {
    const [selectedOption, setSelectedOption] = useState(t('Customer.CustomerList'));
    let labels = [t('Customer.CustomerList')];

    const handleClick = (option) => {
        setSelectedOption(option);
    };

    return (
        <React.Fragment>
            <AppbarComponent labels={labels} selectedButton={selectedOption} handleClick={handleClick} />
            <Stack sx={{ px: { xs: 2, md: 4 }, pt: 6 }}>
                {/* {selectedOption === t('Customer.CustomerList') && <CustomerList />} */}
                {selectedOption === t('Customer.CustomerList') && <CustomerListNew />}
            </Stack>
        </React.Fragment>
    );
};
export default CustomerModule;
