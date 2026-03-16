import { AppBar, Box, Grid2, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import GeneralPage from './General';
import BookingsPage from './Bookings';
import RevenuePage from './Revenue';
import CustomersPage from './Customers';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/en-gb';
import dayjs from 'dayjs';
import moment from 'moment';
import axios, { HttpStatusCode } from 'axios';
import { DropDown } from '../../components/insight/customDropDown';
import { t } from 'i18next';
import { useSelector } from 'react-redux';
import Notauthorized from '../../components/commonComponents/F_Notauthorized';
import Analytics from './Analytics';
import { toast } from 'react-toastify';
import { getAnalyticsDataApi } from '../../utils/Api/Insights';
import FSelect from '../../components/commonComponents/F_Select';

dayjs.extend(isoWeek);
dayjs.locale('en-gb');
moment.locale('da');
moment.updateLocale('da', { week: { dow: 1 } });

const commonStyle = {
    // marginLeft: "100px",
    padding: '10px 15px',
    cursor: 'pointer',
    fontWeight: 500,
    color: '#BBB0A4',
};

const InsightsPage = () => {
    const user = useSelector((state) => state.user.data);
    const settings = useSelector((state) => state?.settings?.data);

    const authTokenUser = localStorage.getItem('auth_token');
    const [selectedButton, setSelectedButton] = useState('0');
    const [selectedPage, setSelectedPage] = useState(t('Insights.GeneralOverview'));
    const [hasNoProPlan, setNoHasProPlan] = useState(false);
    const [allData, setAllData] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([Number(localStorage.getItem('employee_id'))]);
    const [topEmployee, setTopEmployee] = useState([]);
    const [startdate, setStartDate] = useState(dayjs().subtract(1, 'month').add(1, 'day'));
    const [endDate, setEndDate] = useState(dayjs());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analyticsData, setAnalyticsData] = useState(null);
    // Fetch data
    const fetchData = useCallback(
        async (signal, empIds) => {
            try {
                const StartDate = startdate.format('YYYY-MM-DD');
                const EndDate = endDate.format('YYYY-MM-DD');

                setLoading(true);

                const [insightResponse, topEmployeeResponse] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_URL}/api/v1/store/insight/web`, {
                        params: {
                            end_date: EndDate,
                            start_date: StartDate,
                            employees: empIds?.length > 0 ? empIds?.join(',') : null,
                        },
                        headers: { Authorization: `Bearer ${authTokenUser}` },
                        signal,
                    }),
                    axios.get(`${process.env.REACT_APP_URL}/api/v1/store/insight/top/employees`, {
                        params: { end_date: EndDate, start_date: StartDate },
                        headers: { Authorization: `Bearer ${authTokenUser}` },
                        signal,
                    }),
                ]);

                setAllData(insightResponse.data.data);

                // console.log('top Employees', topEmployeeResponse?.data.data);

                setTopEmployee(topEmployeeResponse.data.data);
            } catch (err) {
                if (axios.isCancel(err)) {
                    console.error('Request canceled:', err.message);
                } else {
                    setError('Failed to fetch data. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        },
        [authTokenUser, endDate, startdate],
    );

    useEffect(() => {
        if (settings.employees) setEmployees(settings.employees);
    }, [settings.employees]);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
        getAnalyticsData();
        fetchData(signal, selectedEmployees);
        return () => {
            controller.abort();
        };
    }, [fetchData, startdate, endDate]);

    const MemoizedData = useMemo(() => {
        if (loading || !allData) {
            return { generalData: [], topEmployees: [] }; // Fallback values
        }
        return {
            generalData: allData,
            topEmployees: topEmployee,
            analyticsData: analyticsData,
        };
    }, [loading, allData, topEmployee, analyticsData]);

    // const debouncedSetAllData = useCallback(
    //     debounce((data) => setAllData(data), 500),
    //     []
    // );

    // const debouncedSetTopEmployee = useCallback(
    //     debounce((data) => setTopEmployee(data), 500),
    //     []
    // );

    const getAnalyticsData = async () => {
        try {
            const stDate = startdate.format('YYYY-MM-DD');
            const enDate = endDate.format('YYYY-MM-DD');
            const response = await getAnalyticsDataApi({ stDate, enDate });
            if (response.status === HttpStatusCode.Ok) {
                setAnalyticsData(response.data.data);
            }
        } catch (error) {
            toast.error(error.response.data.detail || t('Common.ToastWrong'));
        }
    };

    // Handle button selection
    // const handleButtonSelect = (value) => {
    //     const pages = [t("Insights.GeneralOverview"), t("Common.Bookings"), t("Insights.Revenue"), t("Common.Customers")];
    //     console.log("page value ", pages[value]);

    //     setSelectedPage(pages[+value] || t("Insights.GeneralOverview"));
    //     setSelectedButton(value);
    // };
    if (!user?.settings.view_insights && user?.role !== 'ADMIN') {
        return <Notauthorized />;
    }

    if (error) return <div>{error}</div>;

    const handleClick = (option) => {
        const pages = [
            t('Insights.GeneralOverview'),
            t('Common.Bookings'),
            t('Insights.Revenue'),
            t('Common.Customers'),
            t('Insights.Analytics'),
        ];
        setSelectedPage(pages[option]);
        setSelectedButton(option);
        // setSelectedOption(option);
    };
    const labels = [
        t('Insights.General'),
        t('Common.Bookings'),
        t('Insights.Revenue'),
        t('Common.Customers'),
        t('Insights.Analytics'),
    ];

    const handleSelectEmployee = (e) => {
        const selectedValues = e.target.value;

        let allID = employees?.map((data) => Number(data?.id));
        const defaultEmployee = Number(localStorage.getItem('employee_id'));

        if ((selectedValues === 0 || selectedValues.includes(0)) && allID?.length === selectedEmployees?.length) {
            setSelectedEmployees([defaultEmployee]);
        } else if (selectedValues === 0 || selectedValues.includes(0)) {
            setSelectedEmployees(allID);
        } else if (selectedValues.length === 0) {
            setSelectedEmployees([defaultEmployee]);
        } else {
            setSelectedEmployees(selectedValues);
        }
    };

    return (
        <Box>
            <AppBar
                position="sticky"
                sx={{
                    px: 5,
                    gap: { xs: 1, lg: 10 },
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    boxShadow: '0px 1px 50px 0px rgba(0, 0, 0, 0.05)',
                    overflowX: 'auto',
                    backgroundColor: '#FFFFFF',
                    scrollbarWidth: 'none',
                }}
            >
                <Typography
                    variant="body1"
                    sx={{
                        ...commonStyle,
                        ...(selectedButton === '0' ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 } : {}),
                    }}
                    onClick={() => handleClick('0')}
                >
                    {labels[0]}
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        ...commonStyle,
                        ...(selectedButton === '1' ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 } : {}),
                    }}
                    onClick={() => handleClick('1')}
                >
                    {labels[1]}
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        ...commonStyle,
                        ...(selectedButton === '2' ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 } : {}),
                    }}
                    onClick={() => handleClick('2')}
                >
                    {labels[2]}
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        ...commonStyle,
                        ...(selectedButton === '3' ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 } : {}),
                    }}
                    onClick={() => handleClick('3')}
                >
                    {labels[3]}
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        ...commonStyle,
                        ...(selectedButton === '4' ? { borderBottom: '3px solid #BBB0A4', fontWeight: 700 } : {}),
                    }}
                    onClick={() => handleClick('4')}
                >
                    {labels[4]}
                </Typography>
            </AppBar>

            <Box sx={{ px: { xs: 1, lg: 3 }, py: 2 }}>
                <Grid2
                    container
                    sx={{
                        display: 'flex',
                        justifyContent: 'end',
                        alignItems: 'center',
                        gap: 1,
                        pr: 1,
                    }}
                >
                    {selectedButton != '4' && (
                        <Grid2 size={{ xs: 12, lg: 2.5 }}>
                            <FSelect
                                options={
                                    employees && employees.length > 0
                                        ? employees?.map((emp) => ({
                                              label: emp.name,
                                              value: emp.id,
                                          }))
                                        : []
                                }
                                sx={{
                                    backgroundColor: '#FFFFFF',
                                    width: '100%',
                                }}
                                value={selectedEmployees}
                                onChange={handleSelectEmployee}
                                placeholder={t('Common.SelectEmployee')}
                                isMultiSelect
                                TextToDisplayWithCount={t('Common.Employees')}
                                onClose={() => {
                                    fetchData(null, selectedEmployees);
                                }}
                            />

                            {/* <FormControl sx={{ color: 'black', width: '100%' }}>
                                <Select
                                    displayEmpty
                                    inputProps={{ 'aria-label': 'Without label' }}
                                    multiple
                                    value={selectedEmployees}
                                    onChange={(event) => {
                                        const {
                                            target: { value },
                                        } = event;

                                        if (value.includes(null)) {
                                            setSelectedEmployees([]);
                                            return;
                                        }

                                        setSelectedEmployees(value);

                                        // handleEmployeeSelection(value);
                                    }}
                                    renderValue={(selected) => {
                                        const selectedNames = employees
                                            .filter((emp) => selected.includes(emp.id))
                                            .map((emp) => emp.name);
                                        return selectedNames.length === 0
                                            ? t('Common.AllEmployees')
                                            : selectedNames.join(', ');
                                    }}
                                    MenuProps={MenuProps}
                                    sx={{
                                        color: '#A0A0A0',
                                        border: '1.5px solid #D9D9D9',
                                        backgroundColor: '#FFFFFF',
                                        width: '100%',
                                        minWidth: '220px',
                                        borderRadius: '15px',
                                        height: '42px',
                                        fontSize: '14px',
                                        '.MuiSelect-icon': {
                                            color: '#BBB0A4',
                                            fontSize: '28px',
                                        },
                                        '&.Mui-focused': {
                                            outline: 'none',
                                            boxShadow: 'none',
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            border: 'none',
                                        },
                                        '& .MuiPaper-root': {
                                            backgroundColor: '#FFFFFF',
                                        },
                                    }}
                                >
                                    <MenuItem value={null} sx={{ fontSize: '25px' }}>
                                        <Checkbox
                                            checked={selectedEmployees.length === 0}
                                            sx={{
                                                color: '#BBB0A4',
                                                '&.Mui-checked': {
                                                    color: '#BBB0A4',
                                                },
                                            }}
                                        />
                                        <ListItemText primary={t('Common.AllEmployees')} />
                                    </MenuItem>

                                    {employees.map((employee) => (
                                        <MenuItem key={employee.id} value={employee.id} sx={{ fontSize: '25px' }}>
                                            <Checkbox
                                                checked={selectedEmployees.includes(employee.id)}
                                                sx={{
                                                    color: '#BBB0A4',
                                                    '&.Mui-checked': {
                                                        color: '#BBB0A4',
                                                    },
                                                }}
                                            />
                                            <ListItemText primary={employee.name} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl> */}
                        </Grid2>
                    )}
                    <Grid2 size={{ xs: 12, lg: 2.5 }}>
                        <DropDown
                            setStartDate={setStartDate}
                            setEndDate={setEndDate}
                            startdate={startdate}
                            endDate={endDate}
                        />
                    </Grid2>
                </Grid2>

                {selectedButton === '0' && (
                    <GeneralPage
                        allData={MemoizedData.generalData}
                        loading={loading}
                        topEmployee={topEmployee}
                        selectedButton={selectedButton}
                        selectedPage={selectedPage}
                        hasNoProPlan={hasNoProPlan}
                        startdate={startdate}
                        endDate={endDate}
                    />
                )}
                {selectedButton === '1' && (
                    <BookingsPage
                        allData={MemoizedData.generalData}
                        loading={loading}
                        topEmployee={topEmployee}
                        selectedButton={selectedButton}
                        selectedPage={selectedPage}
                        startdate={startdate}
                        endDate={endDate}
                    />
                )}
                {selectedButton === '2' && (
                    <RevenuePage
                        allData={MemoizedData.generalData}
                        loading={loading}
                        topEmployee={topEmployee}
                        selectedButton={selectedButton}
                        selectedPage={selectedPage}
                        startdate={startdate}
                        endDate={endDate}
                    />
                )}
                {selectedButton === '3' && (
                    <CustomersPage
                        allData={MemoizedData.generalData}
                        loading={loading}
                        topEmployee={topEmployee}
                        selectedButton={selectedButton}
                        selectedPage={selectedPage}
                        startdate={startdate}
                        endDate={endDate}
                    />
                )}
                {selectedButton === '4' && (
                    <Analytics allData={MemoizedData.analyticsData} startDate={startdate} endDate={endDate} />
                )}
            </Box>
        </Box>
    );
};
export default InsightsPage;
