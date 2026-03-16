import React, { memo, useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Grid2, Stack } from '@mui/material';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSAutocomplete from '@/components/POS/Common/POSAutocomplete';
import { t } from 'i18next';
import POSDatePicker from '@/components/POS/Common/POSDatePicker';
import moment, { Moment } from 'moment';
import POSSelect from '@/components/POS/Common/POSSelect';
import { useCart } from '@/context/POS/CartContext';
import { EmployeeListingSchema } from '../../Types/sales.types';
import { useCustomer } from '@/hooks/api/pos';
import { GetApiCustomers200CustomersItem } from '@/shared/api/models';
import OutstandigConfirmation from './Modals/OutstandigConfirmation';
// @ts-ignore
import CreateCustomerForm from '@/components/calanderComponents/booking/createCustomerModal';
import { useDebounce } from '@/hooks/shared';
import { CartOverride } from '@/types/CartContext.type';

const AddNewCustomerData: GetApiCustomers200CustomersItem = {
    name: `+ ${t('Customer.AddNewCustomer')}`,
    id: 0,
    outstandingAmount: 0,
    giftCards: [],
    phoneNumber: '',
};

export default memo(function SalesHeader({ hasSavedCart }: { hasSavedCart: boolean }) {
    const { cart, setCart } = useCart() as {
        cart: CartOverride;
        setCart: React.Dispatch<React.SetStateAction<CartOverride>>;
    };
    const [selectedCustomer, setSelectedCustomer] = useState<GetApiCustomers200CustomersItem | null>(null);
    const [selectedDate, setSelectedDate] = useState<Moment | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeListingSchema | null>(() => {
        const emp = localStorage?.getItem('employee_id');
        return emp ? { id: Number(emp), name: '' } : null;
    });
    const [outstandingModal, setOutstandingModal] = useState<boolean>(false);
    const [createCustomerModal, setCreateCustomerModal] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>('');
    const debouncedSearchTerm = useDebounce(inputValue, 500);

    const setting = useSelector((state: any) => state?.settings?.data);

    const { data: customersData, refetch } = useCustomer({
        params: {
            search: debouncedSearchTerm,
            page: 1,
            limit: 10000,
        },
    });

    useEffect(() => {
        setCart((prev: CartOverride) => ({
            ...prev,
            sellBy: selectedEmployee?.id ?? Number(localStorage?.getItem('employee_id')),
        }));
    }, []);

    const filteredCustomers = useMemo(() => {
        const search = debouncedSearchTerm.trim().toLowerCase();

        const matches =
            customersData?.customers?.filter((customer) => {
                return (
                    customer?.name?.toLowerCase().includes(search) ||
                    customer?.phoneNumber?.toLowerCase().includes(search)
                );
            }) ?? [];

        // Ensure selected customer is always included in the options
        let result = [AddNewCustomerData, ...matches];

        if (selectedCustomer && !matches.find((c) => c.id === selectedCustomer.id)) {
            result = [AddNewCustomerData, selectedCustomer, ...matches];
        }

        return result;
    }, [customersData, debouncedSearchTerm, selectedCustomer]);

    useEffect(() => {
        if (cart?.customerId && customersData?.customers) {
            const match = customersData.customers.find((customer) => customer.id === cart.customerId) ?? undefined;

            // Only set if we don't already have the correct customer selected
            if (match && (!selectedCustomer || selectedCustomer.id !== match.id)) {
                setSelectedCustomer(match as GetApiCustomers200CustomersItem);
                setInputValue(''); // Clear search input when auto-selecting
                setCart((prev: CartOverride) => ({
                    ...prev,
                    customerId: match?.id,
                    customerName: match?.name,
                    customer: match as GetApiCustomers200CustomersItem,
                }));
            }
        }
    }, [cart?.customerId, customersData, selectedCustomer, setCart]);

    useEffect(() => {
        const loggedInEmployee = localStorage?.getItem('employee_id');
        if (cart?.sellBy) {
            setSelectedEmployee(
                setting?.employees?.find((employee: EmployeeListingSchema) => employee.id === cart.sellBy) ??
                    (Number(loggedInEmployee) ? { id: Number(loggedInEmployee), name: '' } : null),
            );
        } else {
            setSelectedEmployee(Number(loggedInEmployee) ? { id: Number(loggedInEmployee), name: '' } : null);
        }

        if (cart?.salesDate) {
            setSelectedDate(moment(cart.salesDate));
        }
    }, [cart?.sellBy, cart?.salesDate, setting?.employees]);

    useEffect(() => {
        refetch(); // re-fetch customers when search input changes
    }, [debouncedSearchTerm, refetch]);

    const handleCustomerChange = (customer: GetApiCustomers200CustomersItem | null) => {
        if (customer?.id === 0) {
            setCreateCustomerModal(true);
            return;
        }

        if (customer) {
            if (customer?.outstandingAmount > 0) {
                setOutstandingModal(true);
            }
            setSelectedCustomer(customer);
            setCart((prev: CartOverride) => ({
                ...prev,
                customerId: customer.id,
                customerName: customer.name,
                customer: customer as GetApiCustomers200CustomersItem,
            }));
        } else {
            setSelectedCustomer(null);
            setCart((prev: CartOverride) => ({
                ...prev,
                customerId: null,
                customerName: '',
                customer: undefined,
            }));
        }
    };

    return (
        <Grid2
            container
            spacing={1}
            size={{ xs: 12 }}
            sx={{
                m: 0,
                height: { xs: 'auto', md: 80 },
                px: { xs: 2, md: 0 },
            }}
        >
            <Grid2 size={{ xs: 12, md: 4 }}>
                <POSHeading text={t('Common.Customers')} sx={{ fontSize: 14, fontWeight: 600 }} />
                <Stack direction="row" spacing={1} alignItems="center" border="1px solid #D9D9D9" borderRadius={2}>
                    <POSAutocomplete
                        disabled={hasSavedCart}
                        options={filteredCustomers}
                        sx={{ borderRadius: 2 }}
                        getOptionLabel={(option) => option?.name ?? ''}
                        getOptionKey={(option) => option?.id ?? 'new-customer'}
                        placeholder={t('Common.Customers')}
                        width={'100%'}
                        border="none"
                        value={selectedCustomer}
                        onChange={(_, newValue, reason) => {
                            if (reason === 'clear') {
                                setInputValue('');
                            }
                            handleCustomerChange(newValue as GetApiCustomers200CustomersItem);
                        }}
                        onInputChange={(e) => {
                            setInputValue(e.target.value);
                        }}
                        filterOptions={(options) => options} // disables built-in filtering
                    />
                </Stack>
            </Grid2>

            <Grid2 size={{ xs: 12, md: 4 }}>
                <POSHeading text={t('POS.ReceiptDate')} sx={{ fontSize: 14, fontWeight: 600 }} />
                <POSDatePicker
                    disabled={hasSavedCart}
                    value={selectedDate ? moment(selectedDate) : moment()}
                    onChange={(date) => {
                        date && setSelectedDate(date);
                        setCart((prev: CartOverride) => ({
                            ...prev,
                            salesDate: date?.toDate().toISOString(),
                        }));
                    }}
                    sx={{ borderRadius: 2, width: '100%' }}
                />
            </Grid2>

            <Grid2 size={{ xs: 12, md: 4 }}>
                <POSHeading text={t('POS.ServedBy')} sx={{ fontSize: 14, fontWeight: 600 }} />
                <POSSelect
                    disabled={hasSavedCart}
                    options={
                        setting?.employees?.map((employee: EmployeeListingSchema) => ({
                            label: employee.name ?? '',
                            value: employee.id ?? '',
                        })) ?? []
                    }
                    onChange={(event: any) => {
                        const loggedInEmployee = localStorage?.getItem('employee_id');
                        const employee = setting?.employees?.find(
                            (employee: EmployeeListingSchema) => employee.id === event.target.value,
                        );
                        setSelectedEmployee(
                            employee ?? (Number(loggedInEmployee) ? { id: Number(loggedInEmployee), name: '' } : null),
                        );
                        setCart((prev: CartOverride) => ({
                            ...prev,
                            sellBy: employee?.id ?? null,
                        }));
                    }}
                    placeholderText={t('Common.Employees')}
                    value={selectedEmployee?.id ?? ''}
                    sx={{ borderRadius: 2, width: '100%' }}
                />
            </Grid2>

            {outstandingModal && (
                <OutstandigConfirmation
                    open={outstandingModal}
                    onClose={() => setOutstandingModal(false)}
                    customer={selectedCustomer as GetApiCustomers200CustomersItem}
                />
            )}

            {createCustomerModal && (
                <CreateCustomerForm
                    setCustomer={(customerList: GetApiCustomers200CustomersItem[]) => {
                        setSelectedCustomer(customerList[1]);
                        setCart((prev: CartOverride) => ({
                            ...prev,
                            customerId: customerList[1].id,
                            customerName: customerList[1].name,
                            customer: customerList[1],
                        }));
                        setCreateCustomerModal(false);
                    }}
                    open={createCustomerModal}
                    closeForm={() => setCreateCustomerModal(false)}
                    props={inputValue}
                />
            )}
        </Grid2>
    );
});
