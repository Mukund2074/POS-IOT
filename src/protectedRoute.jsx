import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getRequiredPermissionForPath } from './utils/permissionMap.ts';

const DOCTOR_ALLOWED_PATH_PREFIX = '/customers';

const ProtectedRoute = ({ element }) => {
    const token = localStorage.getItem('auth_token');
    const location = useLocation();
    const user = useSelector((state) => state.user?.data);
    const isDoctorFromStore = useSelector((state) => state.settings?.data?.isDoctor);
    const isDoctor = isDoctorFromStore === true || localStorage.getItem('employee_role') === 'DOCTOR';

    // If token doesn't exist, redirect to login
    if (!token) {
        return <Navigate to="/" state={{ from: location }} replace={true} />;
    }

    // Doctor can only access /customers and /customers/*
    if (isDoctor && !location.pathname.startsWith(DOCTOR_ALLOWED_PATH_PREFIX)) {
        return <Navigate to="/unauthorized" state={{ from: location, callbackUrl: '/customers' }} replace />;
    }

    // Permission check: if this path requires a permission, user must have it (check both .permission and .settings)
    const requiredPermission = getRequiredPermissionForPath(location.pathname);
    const permission = user?.permission ?? user?.settings ?? {};
    if (user?.role !== 'ADMIN' && requiredPermission && !permission[requiredPermission]) {
        return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }

    return element;
};

export default ProtectedRoute;
