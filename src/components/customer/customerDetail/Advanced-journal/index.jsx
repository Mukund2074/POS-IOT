import React, { useEffect, useState } from 'react';
import TableView from './TableView';
import AdvancedJournalView from './AdvancedView';
import { HttpStatusCode } from 'axios';
import apiFetcher from '../../../../utils/interCeptor';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useCustomer } from '../../../../context/customer/CustomerContext';

export default function AdvancedJournal() {
    const location = useLocation();
    const [customerAdvancedTemplates, setCustomerAdvancedTemplates] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [setup, setSetup] = useState([]);
    const [selectedAdvancedJournalId, setSelectedAdvancedJournalId] = useState({});
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState('Table');
    const [customer, setCustomer] = useState(null);
    const { id } = useParams();
    const settings = useSelector((state) => state?.settings.data);
    const navigate = useNavigate();
    const { customer: customerData } = useCustomer();

    useEffect(() => {
        if (customerData) {
            setCustomer(customerData);
        }
    }, [customerData]);

    const getAdvancedTemplates = async () => {
        try {
            setLoading(true);
            const listResponse = await apiFetcher.get(`api/v1/store/advance_journal?outlet_customer_id=${id}`);
            if (listResponse.status === HttpStatusCode.Ok) {
                setCustomerAdvancedTemplates(listResponse?.data?.data);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTemplates = async () => {
        try {
            const selectResponse = await apiFetcher.get(`api/v1/store/journal/template/list?advance=true`);
            if (selectResponse.status === HttpStatusCode.Ok) {
                setTemplates(selectResponse?.data?.data);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const getSetups = async () => {
        try {
            const selectResponse = await apiFetcher.get(`api/v1/store/advance_journal/formats`);
            if (selectResponse.status === HttpStatusCode.Ok) {
                setSetup(selectResponse?.data?.data);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    useEffect(() => {
        if (!settings?.profile?.allow_advance_journal) {
            navigate('/customers');
        }
        setCustomer(location?.state?.data);
        getSetups();
        getTemplates();
        if (id) {
            getAdvancedTemplates(id);
        }
    }, []);

    return (
        <React.Fragment>
            {show === 'Table' && (
                <TableView
                    setup={setup}
                    getAdvancedTemplates={getAdvancedTemplates}
                    customerAdvancedTemplates={customerAdvancedTemplates}
                    setSelectedAdvancedJournalId={setSelectedAdvancedJournalId}
                    loading={loading}
                    customer={customer}
                    setShow={setShow}
                />
            )}
            {show === 'Advanced' && selectedAdvancedJournalId && !loading?.initialJournal && (
                <AdvancedJournalView
                    customer={customer}
                    recallApi={getAdvancedTemplates}
                    selectedAdvancedJournalId={selectedAdvancedJournalId}
                    setShow={setShow}
                    templates={templates}
                    setup={setup}
                />
            )}
        </React.Fragment>
    );
}
