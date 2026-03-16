import React from 'react';
import { Outlet } from 'react-router-dom';

const IntegrationLayout = () => {
    return (
        <React.Fragment>
            <Outlet />
        </React.Fragment>
    );
};

export default IntegrationLayout;
