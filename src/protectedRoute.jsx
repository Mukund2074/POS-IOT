import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getRequiredPermissionForPath } from './utils/permissionMap.ts';

const ProtectedRoute = ({ element }) => {
    const location = useLocation();
    const isAdminPath = location.pathname.startsWith('/admin');
    const token = localStorage.getItem(isAdminPath ? 'admin_auth_token' : 'auth_token');
    
    const user = useSelector((state) => state.user?.data);

    if (!token) {
        const redirectPath = isAdminPath ? '/admin-login' : '/';
        return <Navigate to={redirectPath} state={{ from: location }} replace={true} />;
    }

    const requiredPermission = getRequiredPermissionForPath(location.pathname);
    const permission = user?.permission ?? user?.settings ?? {};
    if (user?.role !== 'ADMIN' && requiredPermission && !permission[requiredPermission]) {
        return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }

    return element;
};

export default ProtectedRoute;
