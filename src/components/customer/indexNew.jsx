import { Box, CircularProgress, Stack, Typography, useMediaQuery } from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import { t } from 'i18next';
import { useNavigate } from 'react-router-dom';
import axios, { HttpStatusCode } from 'axios';
import RadixInput from '../radix/RadixInput';
import RadixMultiSelect from '../radix/RadixMultiSelect';
import RadixButton from '../radix/RadixButton';
import RadixTable from '../radix/RadixTable';
import { debounce } from 'lodash';
import moment from 'moment';
import { useSelector } from 'react-redux';
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
        export: false,
    });
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 20;
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
    const fetchCustomerList = async ({ cus, emp, lim, off, ord, srb, load = false }) => {
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
                        setTotalCount(totalItems);
                        setApiData((prev) => ({ ...prev, customers: newCustomers }));
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
                    }));
                });
        }
    };

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const canGoPrev = page > 0;
    const canGoNext = totalCount > 0 && (page + 1) * PAGE_SIZE < totalCount;

    const goToPage = (nextPage) => {
        setPage(nextPage);
        fetchCustomerList({
            cus: searchTerm,
            emp: selectedEmployee.length === employeeObjForSelect.length ? '' : selectedEmployee,
            lim: PAGE_SIZE,
            off: nextPage * PAGE_SIZE,
            ord: order,
            srb: keyObj[sortBy],
            load: true,
        });
    };

    useEffect(() => {
        if (setting?.employees) {
            setApiData({ ...apiData, employees: setting.employees });
        }
    }, [setting]);

    useEffect(() => {
        fetchCustomerList({
            cus: '',
            emp: selectedEmployee.length === employeeObjForSelect.length ? '' : selectedEmployee,
            lim: PAGE_SIZE,
            off: 0,
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
            setPage(0);
            fetchCustomerList({
                cus: searchValue,
                emp: employeeSelection.length === employeeObjForSelect.length ? '' : employeeSelection,
                lim: PAGE_SIZE,
                off: 0,
                ord: order,
                srb: keyObj[sortBy],
                load: true,
            });
        }, 500),
        [employeeObjForSelect, order, sortBy],
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
        if (number !== '') {
            return number?.replace(/(\d{2})(?=\d)/g, '$1 ');
        }
        return '';
    };

    const handleSort = (column) => {
        const newOrder = order === 'asc' ? 'desc' : 'asc';
        setOrder(newOrder);
        setSortBy(column);
        setPage(0);

        fetchCustomerList({
            cus: searchTerm,
            emp: selectedEmployee.length === employeeObjForSelect.length ? '' : selectedEmployee,
            lim: PAGE_SIZE,
            off: 0,
            ord: newOrder,
            srb: keyObj[column],
            load: true,
        });
    };

    const visibleColumnIds = isMobile
        ? ['name', 'phone', 'GoTo']
        : ['name', 'phone', 'email', 'lastBooking', 'Bookings', 'AssignedTo', 'GoTo'];

    const columnWidthsMap = isMobile
        ? { name: '50%', phone: '50%', GoTo: '0%' }
        : {
              name: '15%',
              phone: '15%',
              email: '20%',
              lastBooking: '20%',
              Bookings: '10%',
              AssignedTo: '15%',
              GoTo: '5%',
          };

    const radixTableColumns = columns
        .filter((c) => visibleColumnIds.includes(c.id))
        .map((c) => ({
            id: c.id,
            name: c.label,
            sortable: c.sortable,
            width: columnWidthsMap[c.id],
            selector: (row) => row[c.id] ?? '',
        }));

    useEffect(() => {
        const data = apiData.customers.map((data) => ({
            id: data.id,
            name: `${data.block_booking ? '🚫 ' : ''}${data.name}`,
            phone:
                data.phone_number.length > 0
                    ? `${data?.country_code ?? '+91'} ${formatPhoneNumber(data.phone_number)}`
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
            <div className="flex flex-col gap-2 py-2 lg:flex-row lg:flex-wrap lg:items-center lg:gap-2">
                <Typography
                    sx={{ color: '#545454', fontSize: '22px' }}
                    variant="h6"
                    className="w-full shrink-0 lg:w-auto"
                >
                    {t('Common.Customers')}
                </Typography>

                {/* Mobile: 1 column; md–lg: 2×2 grid; lg+: single row with controls inline */}
                <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2 lg:contents">
                    <Box className="w-full min-w-0 px-0 md:px-1 lg:ml-auto lg:w-auto lg:min-w-[200px] lg:max-w-[min(320px,100%)]">
                        <RadixInput
                            placeholder={`${t('Common.Search')}...`}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full rounded-full"
                        />
                    </Box>

                    <RadixMultiSelect
                        options={employeeObjForSelect.map((o) => ({
                            label: o.label,
                            value: String(o.value),
                        }))}
                        selectedValues={new Set(selectedEmployee.map(String))}
                        onSelectionChange={(set) => {
                            const picked = Array.from(set).map(Number);
                            const allID = employeeObjForSelect?.map((data) => data.value) ?? [];
                            let next =
                                picked.length === 0
                                    ? []
                                    : picked.length === allID.length && allID.length > 0
                                      ? allID
                                      : picked;
                            setSelectedEmployee(next);
                            setPage(0);
                            fetchCustomerList({
                                cus: searchTerm,
                                emp: next.length === allID.length ? '' : next,
                                lim: PAGE_SIZE,
                                off: 0,
                                ord: order,
                                srb: keyObj[sortBy],
                                load: true,
                            });
                        }}
                        placeholder={t('Common.AllEmployees')}
                        selectAllLabel={t('Common.AllEmployees')}
                        textToDisplayWithCount={t('Common.Employees')}
                        showSelectAll
                        className="w-full min-w-0 md:w-full lg:w-fit"
                    />

                    {user?.settings?.create_customers && (
                        <RadixButton
                            type="button"
                            variant="primary"
                            onClick={handleCreateCustomer}
                            className="w-full min-w-0 md:w-full lg:w-fit"
                        >
                            {`+ ${t('Customer.AddNewCustomer')}`}
                        </RadixButton>
                    )}
                </div>
            </div>

            <RadixTable
                loading={loading?.table}
                columns={radixTableColumns}
                data={dataForColumn}
                onRowClick={handleRowClick}
                defaultOrder="name"
                isServerSorting
                onSort={handleSort}
                serverSortOrder={order}
            />

            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
                gap={2}
                py={2}
                px={0.5}
            >
                <Typography sx={{ color: '#666', fontSize: 14 }}>
                    {totalCount === 0
                        ? '—'
                        : `${t('Common.Page')} ${page + 1} ${t('Common.of')} ${totalPages} · ${totalCount}`}
                </Typography>
                <Stack direction="row" alignItems="center" gap={1}>
                    <RadixButton
                        type="button"
                        iconOnly
                        variant="secondary"
                        disabled={!canGoPrev || loading?.table}
                        onClick={() => goToPage(page - 1)}
                        aria-label={t('Common.Before')}
                    >
                        ←
                    </RadixButton>
                    <RadixButton
                        type="button"
                        variant="secondary"
                        iconOnly
                        disabled={!canGoNext || loading?.table}
                        onClick={() => goToPage(page + 1)}
                        aria-label={t('Common.Next')}
                    >
                        →
                    </RadixButton>
                </Stack>
            </Stack>
        </Stack>
    );
};

export default CustomerListNew;
