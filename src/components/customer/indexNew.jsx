import { CircularProgress, Stack, useMediaQuery } from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import { t } from 'i18next';
import FSelect from '../commonComponents/F_Select';
import FButton from '../commonComponents/F_Button';
import FPrimaryHeading from '../commonComponents/F_PrimaryHeading';
import { useNavigate } from 'react-router-dom';
import FCommonTable from '../commonComponents/F_commonTable';
import axios, { HttpStatusCode } from 'axios';
import FTextInput from '../commonComponents/F_TextInput';
import { debounce } from 'lodash';
import moment from 'moment';
import { useSelector } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTheme } from '@emotion/react';
import apiFetcher2 from '../../utils/Api/POS/Interceptor2';

// Define columns explicitly

const CustomerListNew = () => {
    const user = useSelector((state) => state.user.data);
    const setting = useSelector((state) => state.settings?.data);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // moment.locale('da')
    const [apiData, setApiData] = useState({
        employees: [],
        customers: [],
    });
    const [employeeObjForSelect, setEmployeeObjForSelect] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cancelToken, setCancelToken] = useState(null);
    const [loading, setLoading] = useState({
        page: false,
        table: false,
        more: false,
    });
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const PAGE_SIZE = 50;
    const [order, setOrder] = useState('asc');
    const [sortBy, setSortBy] = useState('name');

    const [dataForColumn, setDataForColumn] = useState([]);

    const navigate = useNavigate();
    const columns = [
        { id: 'id', label: `${t('Common.ID')}`, sortable: true },
        { id: 'name', label: `${t('Common.Name')}`, sortable: true },
        { id: 'phone', label: `${t('Common.Phone')}`, sortable: false },
        { id: 'email', label: `${t('Common.Email')}`, sortable: false },
        { id: 'lastBooking', label: `${t('Common.LastBooking')}`, sortable: true },
        { id: 'Bookings', label: `${t('Common.Bookings')}`, sortable: true },
        { id: 'AssignedTo', label: `${t('Common.AssignedTo')}`, sortable: false },
        { id: 'GoTo', label: ' ', sortable: false },
    ];

    const keyObj = {
        name: 'name',
        lastBooking: 'last_booking_date',
        Bookings: 'total_bookings',
    };
    const fetchSuggestions = debounce(async ({ cus, emp, lim, off, reset = false, ord, srb, load = false }) => {
        if (cus.trim() || emp === '' || emp) {
            if (cancelToken) {
                cancelToken.cancel('Canceling previous request');
            }
            const source = axios.CancelToken.source();
            setCancelToken(source);
            setLoading((prev) => ({
                ...prev,
                table: load,
            }));

            axios
                .get(
                    `${process.env.REACT_APP_URL}/api/v1/store/customer/outlet?search=${cus}&employees=${emp}&offset=${off}&limit=${lim}&sort_by=${srb}&sort=${ord}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                        },
                        cancelToken: source.token,
                    },
                )
                .then((response) => {
                    if (response.status === HttpStatusCode.Ok) {
                        const newCustomers = response?.data?.data?.data || [];
                        const totalItems = response?.data?.data?.total || 0;
                        const currentCount = reset
                            ? newCustomers.length
                            : apiData.customers.length + newCustomers.length;

                        setHasMore(currentCount < totalItems);

                        if (reset) {
                            setApiData((prev) => ({ ...prev, customers: newCustomers }));
                        } else {
                            setApiData((prev) => ({
                                ...prev,
                                customers: [...prev.customers, ...newCustomers],
                            }));
                        }
                    }
                })
                .catch((thrown) => {
                    if (axios.isCancel(thrown)) {
                        console.error('Request canceled:', thrown.message);
                    } else {
                        console.error('Error fetching suggestions:', thrown);
                    }
                })
                .finally(() => {
                    setLoading((prev) => ({
                        ...prev,
                        table: false,
                        more: false,
                    }));
                });
        }
    }, 500);

    const fetchNextPage = () => {
        setLoading((prev) => ({
            ...prev,
            more: true,
        }));
        const nextPage = offset + PAGE_SIZE;
        setOffset(nextPage);
        fetchSuggestions({
            cus: searchTerm,
            emp: selectedEmployee.length === employeeObjForSelect.length ? '' : selectedEmployee,
            lim: PAGE_SIZE,
            off: nextPage,
            reset: false,
            ord: order,
            srb: keyObj[sortBy],
        });
    };

    useEffect(() => {
        if (setting?.employees) {
            setApiData({ ...apiData, employees: setting.employees });
        }
    }, [setting]);

    useEffect(() => {
        fetchSuggestions({
            cus: '',
            emp: selectedEmployee.length === employeeObjForSelect.length ? '' : selectedEmployee,
            // pageNum: 1,
            lim: PAGE_SIZE,
            off: 0,
            reset: true,
            ord: order,
            srb: keyObj[sortBy],
            load: true,
        });
    }, []);

    useEffect(() => {
        if (apiData.employees && apiData.employees.length > 0) {
            let newData = apiData.employees.map((data) => ({
                value: data.id,
                label: data.name,
            }));

            // Only update if there's new data
            setEmployeeObjForSelect((prev) => [...newData]);

            setSelectedEmployee(newData.map((data) => data.value));
        }
    }, [apiData.employees]);

    const handleRowClick = (row) => {
        navigate(`/customers/${row.id}/customerinformation`, { state: { data: row } });
    };

    const handleCreateCustomer = () => {
        navigate('/customers/create', { state: { isEdit: false } });
    };

    // Create a debounced search handler
    const debouncedSearch = useCallback(
        debounce((searchValue, employeeSelection) => {
            setOffset(0);
            fetchSuggestions({
                cus: searchValue,
                emp: employeeSelection.length === employeeObjForSelect.length ? '' : employeeSelection,
                lim: PAGE_SIZE,
                off: 0,
                reset: true,
                ord: order,
                srb: keyObj[sortBy],
                load: true,
            });
        }, 500),
        [employeeObjForSelect],
    );

    const handleSearchChange = (e) => {
        const value = e.target.value;

        // Check if the value is a number, ignoring spaces
        const isNumber = /^\s*(\d+\s*)+$/.test(value);
        const processedValue = isNumber ? value.replace(/\s/g, '') : value;
        setSearchTerm(value);
        debouncedSearch(processedValue, selectedEmployee);
    };

    const handleSelectEmployee = (e) => {
        const selectedValues = e.target.value;

        let allID = employeeObjForSelect?.map((data) => data.value);

        if ((selectedValues === 0 || selectedValues.includes(0)) && allID.length === selectedEmployee.length) {
            setSelectedEmployee([]);
        } else if (selectedValues === 0 || selectedValues.includes(0)) {
            setSelectedEmployee(allID);
        } else if (selectedValues.length === 0) {
            setSelectedEmployee([]);
        } else {
            setSelectedEmployee(selectedValues);
        }
    };

    const formatPhoneNumber = (number) => {
        if (number != '') {
            return number?.replace(/(\d{2})(?=\d)/g, '$1 ');
        } else {
            return '';
        }
    };

    const handleSort = (column) => {
        const newOrder = order === 'asc' ? 'desc' : 'asc';
        setOrder(newOrder);
        setSortBy(column);
        setOffset(0);

        fetchSuggestions({
            cus: searchTerm,
            emp: selectedEmployee.length === employeeObjForSelect.length ? '' : selectedEmployee,
            lim: PAGE_SIZE,
            off: 0,
            reset: true,
            ord: newOrder,
            srb: keyObj[column],
            load: true,
        });
    };

    useEffect(() => {
        const data = apiData.customers.map((data) => ({
            id: data.id,
            name: `${data.block_booking ? '🚫 ' : ''}${data.name}`,
            phone:
                data.phone_number.length > 0
                    ? `${data?.country_code ?? '+45'} ${formatPhoneNumber(data.phone_number)}`
                    : '',
            email: data.email,
            lastBooking: data.last_booking_date
                ? `${moment(data.last_booking_date, 'YYYY-MM-DDTHH:mm:ss').format('DD/MM-YY')} kl. ${moment(data.last_booking_date, 'YYYY-MM-DDTHH:mm:ss').format('HH:mm')}`
                : '',
            Bookings: data.total_bookings,
            AssignedTo: data.employees.map((emp) => emp?.name).join(', '),
            GoTo: data.id,
        }));
        setDataForColumn(data);
    }, [apiData.customers]);

    if (loading?.page)
        return (
            <Stack
                sx={{
                    position: 'absolute',
                    zIndex: 110,
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.1)',
                }}
            >
                <CircularProgress size="2.5rem" sx={{ color: '#6f6f6f' }} />
            </Stack>
        );
    return (
        <Stack pb={4}>
            <Stack
                display={'flex'}
                flexDirection={{ xs: 'wrap', md: 'row' }}
                alignItems={{ xs: 'flex-start', md: 'center' }}
                gap={2}
                py={2}
            >
                <FPrimaryHeading text={t('Common.Customers')} />
                <FTextInput
                    backgroundColor="#fff"
                    borderRadius={50}
                    mt={0}
                    sx={{ ml: { xs: 0, md: 'auto' }, width: { xs: '100%', md: '20%' }, px: 1 }}
                    placeholder={`${t('Common.Search')}...`}
                    onChange={handleSearchChange}
                    value={searchTerm}
                />

                <FSelect
                    selectAllRenderText={t('Common.AllEmployees')}
                    backgroundColor="#fff"
                    isMultiSelect={true}
                    value={selectedEmployee}
                    TextToDisplayWithCount={`${t('Common.Employees')}`}
                    sx={{ width: { xs: '100%', md: '20%' } }}
                    onChange={handleSelectEmployee}
                    placeholderText={t('Common.AllEmployees')}
                    selectAllRenderCheckBoxText={t('Common.AllEmployees')}
                    options={employeeObjForSelect}
                    borderRadius={50}
                    padding={0}
                    onClose={() => {
                        // setPage(1);
                        setOffset(0);
                        fetchSuggestions({
                            cus: searchTerm,
                            emp: selectedEmployee.length === employeeObjForSelect.length ? '' : selectedEmployee,
                            lim: PAGE_SIZE,
                            off: 0,
                            reset: true,
                            ord: order,
                            srb: keyObj[sortBy],
                            load: true,
                        });
                    }}
                />

                {user?.settings?.create_customers && (
                    <FButton
                        height={40}
                        variant={'save'}
                        title={`+ ${t('Customer.AddNewCustomer')}`}
                        onClick={handleCreateCustomer}
                        sx={{ borderRadius: 50, py: 1, width: { xs: '100%', md: '30%', lg: '20%' } }}
                    />
                )}

                <FButton
                    title={t('Setting.Export')}
                    sx={{
                        borderRadius: 50,
                        color: '#fff',
                        background: '#44b904',
                        py: 1,
                        width: { xs: '100%', md: '30%', lg: '10%' },
                    }}
                    loading={loading?.more}
                    onClick={async () => {
                        setLoading((prev) => ({ ...prev, more: true }));
                        try {
                            const response = await apiFetcher2.get('/api/customers/export', {
                                responseType: 'blob',
                            });
                            const link = document.createElement('a');
                            const url = (link.href = window.URL.createObjectURL(
                                new Blob([response.data], { type: 'text/csv;charset=utf-8;' }),
                            ));
                            link.setAttribute('download', 'customers.csv');
                            link.click();
                            window.URL.revokeObjectURL(url);
                        } catch (error) {
                            console.error('Export API error:', error);
                        } finally {
                            setLoading((prev) => ({ ...prev, more: false }));
                        }
                    }}
                />
            </Stack>

            <InfiniteScroll
                dataLength={apiData.customers.length}
                next={fetchNextPage}
                hasMore={hasMore}
                loader={
                    <Stack display={loading?.more ? 'flex' : 'none'} alignItems="center" py={2}>
                        <CircularProgress size={24} sx={{ color: '#6f6f6f' }} />
                    </Stack>
                }
                scrollableTarget="customerTableContainer"
            >
                <FCommonTable
                    visibleColumns={
                        isMobile
                            ? ['name', 'phone', 'GoTo']
                            : ['name', 'phone', 'email', 'lastBooking', 'Bookings', 'AssignedTo', 'GoTo']
                    }
                    defaultOrder="name"
                    columnWidths={
                        isMobile
                            ? { name: '50%', phone: '50%', GoTo: '0%' }
                            : {
                                  name: '15%',
                                  phone: '15%',
                                  email: '20%',
                                  lastBooking: '20%',
                                  Bookings: '10%',
                                  AssignedTo: '15%',
                                  GoTo: '5%',
                              }
                    }
                    loading={loading?.table}
                    columns={columns}
                    data={dataForColumn}
                    onRowClick={handleRowClick}
                    fixedLayout={true}
                    isServerSorting
                    onSort={handleSort}
                    serverSortOrder={order}
                />
            </InfiniteScroll>
        </Stack>
    );
};

export default CustomerListNew;
