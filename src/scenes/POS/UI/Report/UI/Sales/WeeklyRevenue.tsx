import { ColumnType, POSTable, RowType } from '@/components/POS/Common';
import { POSDateRangePicker } from '@/components/POS/Common/POSDateRangePicker';
import POSSelect from '@/components/POS/Common/POSSelect';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { GetApiInsightsWeeklyTurnoverType200DataWeeksItem } from '@/shared/api/models';
import { api } from '@/utils/Api/POS';
import { Box, Typography } from '@mui/material';
import { t } from 'i18next';
import moment from 'moment';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Employee from '../../EmployeeDataType';

interface DataforTheTurnoverColumnType {
    [key : string] : number
}
interface DataforThePeriodColumnType {
   [key : string] : number
}

const WeeklyRevenue = () => {
    const [filter, setFilter] = useState({
        fromDate: moment().subtract(3, 'months').format('YYYY-MM-DD'),
        toDate: moment().format('YYYY-MM-DD'),
    });

    const [modalLoading, setModalLoading] = useState<boolean>(false);

    const employee = useSelector((state: any) =>
        state.settings.data.employees.map((emp: Employee) => ({
            label: emp.name,
            value: emp.id,
        })),
    );

    const allEmp = [{ label: t('Common.AllEmployees'), value: -1 }, ...employee];
    const [selectedEmployees, setSelectedEmployees] = useState(-1);

    const ids = [
        'weekNumber',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
        'credited',
        'turnover',
    ];

    const createColumn = useCallback((day: string): ColumnType => {
        const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
        const isTurnoverOrCredited = day === 'credited' || day === 'turnover';

        return {
            id: day,
            name: t(`Report.${capitalizedDay}`),
            selector: (row: RowType) => (
                <Typography>{isTurnoverOrCredited ? formatCurrency(row[day]) : row[day]}</Typography>
            ),
            sortable: false,
        };
    }, []);

    const TurnoverColumn = useMemo(() => ids.map(createColumn), [createColumn]);
    const TotalForThePeriodColumn = useMemo(() => ids.slice(1).map(createColumn), [createColumn]);
    const [dataForTheTurnoverColumn, setDataforTheTurnoverColumn] = useState<DataforTheTurnoverColumnType[]>([]);
    const [dataForThePeriodColumn, setDataForThePeriodColumn] = useState<DataforThePeriodColumnType[]>([]);

    const fetchData = useCallback(async () => {
        try {
            setModalLoading(true);
            const response = await api.getApiInsightsWeeklyTurnoverType({
                employeeId: selectedEmployees === -1 ? undefined : selectedEmployees,
                fromDate: filter.fromDate,
                toDate: filter.toDate,
            });

            const formattedData = response.data.weeks.map((week: GetApiInsightsWeeklyTurnoverType200DataWeeksItem) => ({
                weekNumber: week.weekNumber,
                monday: week.monday.totalRevenue,
                tuesday: week.tuesday.totalRevenue,
                wednesday: week.wednesday.totalRevenue,
                thursday: week.thursday.totalRevenue,
                friday: week.friday.totalRevenue,
                saturday: week.saturday.totalRevenue,
                sunday: week.sunday.totalRevenue,
                credited: week.weekTotal.totalCredit,
                turnover: week.weekTotal.totalRevenue,
            }));

            setDataforTheTurnoverColumn(formattedData);

            const periodInArray = Object.entries(response?.data?.summary?.dayTotals).map(([days, values]) => ({
                days,
                ...values,
            }));

            const formattedPeriod = [
                {
                    monday: periodInArray[0].totalRevenue,
                    tuesday: periodInArray[1].totalRevenue,
                    wednesday: periodInArray[2].totalRevenue,
                    thursday: periodInArray[3].totalRevenue,
                    friday: periodInArray[4].totalRevenue,
                    saturday: periodInArray[5].totalRevenue,
                    sunday: periodInArray[6].totalRevenue,
                    credited: response?.data?.summary?.totalCredit,
                    turnover: response?.data?.summary?.totalRevenue,
                },
            ];

            setDataForThePeriodColumn(formattedPeriod);
        } catch (error) {
            console.error('error', error);
        } finally {
            setModalLoading(false);
        }
    }, [filter.fromDate, filter.toDate, selectedEmployees]);

    useEffect(() => {
        if (filter.fromDate && filter.toDate) {
            fetchData();
        }
    }, [filter.fromDate, filter.toDate, selectedEmployees, fetchData]);

    return (
        <Box>
            <Box sx={{ display: { xs: 'block', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h3" fontWeight={700}>
                    {t('POS.Turnover')}
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 1, md: 4 },
                        mt: { xs: 2, md: 0 },
                    }}
                >
                    <POSSelect
                        options={allEmp}
                        value={selectedEmployees}
                        onChange={(e) => setSelectedEmployees(Number(e.target.value))}
                        sx={{ width: { xs: '100%', md: 180 }, background: '#fff', borderRadius: '45px' }}
                        showPlaceHolder={false}
                        fontColor="#a0a0a0"
                    />
                    <POSDateRangePicker
                        wrapperSx={{
                            width: { xs: '100%', md: 'fit-content' },
                        }}
                        borderRadius={50}
                        startdate={filter.fromDate}
                        endDate={filter.toDate}
                        setStartDate={(date) =>
                            setFilter((prev) => ({
                                ...prev,
                                fromDate: moment(date).format('YYYY-MM-DD'),
                            }))
                        }
                        setEndDate={(date) =>
                            setFilter((prev) => ({
                                ...prev,
                                toDate: moment(date).format('YYYY-MM-DD'),
                            }))
                        }
                    />
                </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
                <POSTable columns={TurnoverColumn} data={dataForTheTurnoverColumn} loading={modalLoading} />
            </Box>

            <Box sx={{ mt: 5 }}>
                <Typography variant="h3" fontWeight={700} mb={2}>
                    {t('Report.TotalForThePeriod')}
                </Typography>
                <POSTable columns={TotalForThePeriodColumn} data={dataForThePeriodColumn} loading={modalLoading} />
            </Box>
        </Box>
    );
};

export default WeeklyRevenue;
