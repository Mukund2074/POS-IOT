import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HttpStatusCode } from 'axios';
import apiFetcher from '../../utils/interCeptor';
import { getApi } from '../../shared/api';
import { useSelector } from 'react-redux';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
    const { id } = useParams();
    const pathname = window.location.pathname;
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    const [customer, setCustomer] = useState(null);
    const [customerSaleDetails, setCustomerSaleDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [customerSaleDetailsLoading, setCustomerSaleDetailsLoading] = useState(true);

    useEffect(() => {
        if (!pathname?.startsWith('/customers/')) {
            setCustomer(null);
            setCustomerSaleDetails(null);
            setLoading(true);
            setCustomerSaleDetailsLoading(true);
        }
    }, [pathname]);

    const fetchCustomerDetails = useCallback(async () => {
        if (!id || !pathname.includes('customer') || id === 'create') return;
        setLoading(true);
        try {
            const response = await apiFetcher.get(`api/v1/store/customer/${id}`);
            if (response.status === HttpStatusCode.Ok) {
                setCustomer(response?.data?.data);
            }
        } catch (error) {
            toast.error('Failed to fetch customer details');
            navigate('/customers');
        } finally {
            setLoading(false);
        }
    }, [id, navigate, pathname]);

    const fetchCustomerSaleDetails = useCallback(async () => {
        if (!id || !pathname.includes('customer') || id === 'create' || !user?.settings?.isDoctor) return;
        setCustomerSaleDetailsLoading(true);
        try {
            const response = await getApi().getApiCustomerId(id);
            setCustomerSaleDetails(response);
        } catch (error) {
            console.log('error', error);
            if (error.message !== 'POS is not enabled. This request is blocked.') {
                toast.error('Failed to fetch customer sale details');
            }
        } finally {
            setCustomerSaleDetailsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, user?.settings?.isDoctor]);

    // ✅ only refetch when id changes
    useEffect(() => {
        fetchCustomerDetails();
        fetchCustomerSaleDetails();
    }, [id, fetchCustomerDetails, fetchCustomerSaleDetails]);

    return (
        <CustomerContext.Provider
            value={{
                customer,
                loading: loading || customerSaleDetailsLoading,
                refreshCustomer: fetchCustomerDetails,
                refreshCustomerSaleDetails: fetchCustomerSaleDetails,
                customerSaleDetails,
            }}
        >
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomer = () => {
    const ctx = useContext(CustomerContext);
    if (!ctx) throw new Error('useCustomer must be used inside <CustomerProvider>');
    return ctx;
};
