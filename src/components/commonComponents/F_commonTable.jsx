import React, { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Stack,
    Typography,
    CircularProgress,
    Box,
} from '@mui/material';
import { ArrowDropDownRounded, ArrowDropUpRounded, ArrowForward } from '@mui/icons-material';
import { t } from 'i18next';
import moment from 'moment';

const FCommonTable = ({
    columns,
    data,
    loading = false,
    onRowClick = () => {},
    columnWidths,
    headerColor = '#e6e6e6',
    bodyColor = '#fff',
    defaultOrder = '',
    visibleColumns = [],
    fixedLayout = false,
    isServerSorting = false,
    onSort = () => {},
    serverSortOrder = 'asc',
    showNavigatorArrow = true,
    disableWrap = false,
    expandTableTitle,
    isExpandable = false,
    expandColumn = [],
    expandData = [],
    onExpandRowClick = () => {},
    expandedRow,
    expandColumnWidth,
}) => {
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState(defaultOrder);
    const [sortedData, setSortedData] = useState([]);
    const [showNoData, setShowNoData] = useState(false);

    useEffect(() => {
        if (!isServerSorting) {
            handleSortRequest(orderBy, order);
        }
        setSortedData(data);

        // Reset showNoData when new data is loading
        if (loading) {
            setShowNoData(false);
        }

        // Add delay before showing "No Data"
        const timer = setTimeout(() => {
            setShowNoData(!loading && (!data || data.length === 0));
        }, 500);

        return () => clearTimeout(timer);
    }, [data, loading]);

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
        handleSortRequest(property, isAsc ? 'desc' : 'asc');
    };

    const handleSortRequest = (property, order) => {
        const sorted = [...data].sort((a, b) => {
            const valueA = a[property];
            const valueB = b[property];

            let comparison = 0;

            if (typeof valueA === 'string' && typeof valueB === 'string') {
                // Handle date string in DD/MM-YYYY format using moment
                if (isValidDate(valueA) && isValidDate(valueB)) {
                    comparison = moment(valueA, 'DD/MM-YYYY').valueOf() - moment(valueB, 'DD/MM-YYYY').valueOf();
                } else {
                    comparison = valueA.localeCompare(valueB, undefined, { sensitivity: 'base' });
                }
            } else if (typeof valueA === 'number' && typeof valueB === 'number') {
                comparison = valueA - valueB;
            } else if (moment(valueA).isValid() && moment(valueB).isValid()) {
                comparison = moment(valueA).valueOf() - moment(valueB).valueOf();
            } else {
                comparison = String(valueA).localeCompare(String(valueB), undefined, { sensitivity: 'base' });
            }

            return order === 'asc' ? comparison : -comparison;
        });

        setSortedData(sorted);
    };

    // Function to check if a string is a valid date in DD/MM-YYYY format
    const isValidDate = (dateString) => {
        return moment(dateString, 'DD/MM-YYYY', true).isValid();
    };

    const filteredColumns = columns.filter((column) => visibleColumns.includes(column.id));
    const filteredData = sortedData.map((row) => {
        const filteredRow = {};
        filteredColumns.forEach((column) => {
            filteredRow[column.id] = row[column.id];
        });
        return filteredRow;
    });

    const statusObj = {
        BOOKED: t('Common.Pending'),
        RESCHEDULED: t('Common.Pending'),
        OFFER_ACCEPTED: t('Common.Pending'),
        NOSHOW: t('Common.Absence'),
        OFFERED: t('Common.Cancelled'),
        CANCELLED: t('Common.Cancelled'),
        AUTOCOMPLETED: t('Common.Completed'),
        COMPLETED: t('Common.Completed'),
        Pending: t('Common.Pending'),
        Completed: t('Common.Completed'),
        Cancelled: t('Common.Cancelled'),
        Absence: t('Common.Absence'),
    };

    const statusColor = {
        BOOKED: '#E19957',
        RESCHEDULED: '#E19957',
        OFFER_ACCEPTED: '#E19957',
        NOSHOW: '#A36437',
        OFFERED: '#C74141',
        CANCELLED: '#C74141',
        COMPLETED: '#367B3D',
        AUTOCOMPLETED: '#367B3D',
        Pending: '#E19957',
        Completed: '#367B3D',
        Cancelled: '#C74141',
        Absence: '#A36437',
    };

    return (
        <Stack
            sx={{
                height: 'auto',
                width: '100%',
                borderRadius: 5,
                overflow: 'hidden',
                position: 'relative',
                filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.05))',
            }}
        >
            <TableContainer
                id="customerTableContainer"
                component={Paper}
                sx={{ maxHeight: 'calc(100vh - 150px)', scrollbarWidth: 'none', overflow: 'auto' }}
            >
                <Table
                    sx={{
                        minWidth: { xs: 300, sm: 450, md: 650 },
                        tableLayout: fixedLayout ? 'fixed' : 'auto',
                        width: '100%',
                    }}
                    aria-labelledby="tableTitle"
                >
                    <TableHead sx={{ bgcolor: headerColor, position: 'sticky', top: 0, zIndex: 1 }}>
                        <TableRow>
                            {filteredColumns.map((column, index) => (
                                <TableCell
                                    key={index}
                                    sortDirection={orderBy === column.id ? order : false}
                                    sx={{
                                        width: columnWidths ? columnWidths[column.id] : 'auto',

                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        py: 1,
                                        px: 2,
                                    }}
                                >
                                    {column.sortable ? (
                                        <IconButton
                                            disableRipple
                                            sx={{ pl: 0 }}
                                            onClick={() => {
                                                if (isServerSorting) {
                                                    onSort(column.id);
                                                } else {
                                                    handleRequestSort(column.id);
                                                }
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#1F1F1F' }}>
                                                {column.label}
                                            </Typography>
                                            {isServerSorting ? (
                                                serverSortOrder === 'asc' ? (
                                                    <ArrowDropDownRounded />
                                                ) : (
                                                    <ArrowDropUpRounded />
                                                )
                                            ) : orderBy === column.id && order === 'asc' ? (
                                                <ArrowDropDownRounded />
                                            ) : (
                                                <ArrowDropUpRounded />
                                            )}
                                        </IconButton>
                                    ) : column.label === 'Edit' ? (
                                        <Typography
                                            variant="body1"
                                            sx={{ textAlign: 'center', fontWeight: 700, color: '#1F1F1F' }}
                                        >
                                            {column.label}
                                        </Typography>
                                    ) : (
                                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#1F1F1F' }}>
                                            {column.label}
                                        </Typography>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody sx={{ bgcolor: bodyColor }}>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={filteredColumns.length} sx={{ textAlign: 'center', py: 2 }}>
                                    <CircularProgress size={22} sx={{ color: '#6f6f6f' }} />
                                </TableCell>
                            </TableRow>
                        ) : showNoData ? (
                            <TableRow>
                                <TableCell colSpan={filteredColumns.length} sx={{ textAlign: 'center', py: 2 }}>
                                    <Typography sx={{ color: '#1F1F1F' }} variant="body1">
                                        {t('Components.NoData')}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((row, rowIndex) => (
                                <React.Fragment key={rowIndex}>
                                    <TableRow
                                        hover
                                        tabIndex={-1}
                                        key={row.id}
                                        onClick={() => {
                                            if (isExpandable) {
                                                onExpandRowClick(rowIndex); // expand row
                                            } else if (row.GoTo) {
                                                onRowClick(data.find((item) => item.id === row.GoTo));
                                            }
                                        }}
                                        sx={{ cursor: row.GoTo ? 'pointer' : 'default' }}
                                    >
                                        {filteredColumns.map((column, colIdx) => (
                                            <TableCell
                                                key={colIdx}
                                                id={'column-' + column.id}
                                                sx={{
                                                    width: columnWidths ? columnWidths[column.id] : 'auto',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    py: 1,
                                                    px: 2,
                                                }}
                                            >
                                                {column.id === 'GoToComponent' ? (
                                                    <div>{row.GoToComponent}</div>
                                                ) : column.id === 'GoTo' ? (
                                                    <Stack sx={{ display: !showNavigatorArrow ? 'none' : 'block' }}>
                                                        <IconButton
                                                            size="small"
                                                            disableRipple
                                                            disableFocusRipple
                                                            sx={{ color: '#44B904' }}
                                                            onClick={(event) => {
                                                                event.stopPropagation(); // Prevent the row click from firing
                                                                onRowClick(data.find((item) => item.id === row.GoTo));
                                                            }}
                                                        >
                                                            <ArrowForward />
                                                        </IconButton>
                                                    </Stack>
                                                ) : column.id === 'status' ? (
                                                    <Typography
                                                        color={'#1F1F1F'}
                                                        variant="body1"
                                                        sx={{
                                                            color: statusColor[row[column.id]] || '#1F1F1F',
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        {statusObj[row[column.id]]}
                                                    </Typography>
                                                ) : column.id === 'total' ? (
                                                    <Typography color={'#1F1F1F'} variant="body1">
                                                        {row[column.id]} Kr.
                                                    </Typography>
                                                ) : column.id === 'journal_id' ? (
                                                    <Typography color={'#1F1F1F'} fontWeight={700} variant="body1">
                                                        {row[column.id]}
                                                    </Typography>
                                                ) : (
                                                    <Typography
                                                        sx={{
                                                            maxWidth: disableWrap ? 'none' : '200px', // Set the max width as needed
                                                            overflow: disableWrap ? 'visible' : 'hidden',
                                                            textOverflow: disableWrap ? 'visible' : 'ellipsis',
                                                            whiteSpace: disableWrap ? 'pre-line' : 'nowrap',
                                                        }}
                                                        color={'#1F1F1F'}
                                                        variant="body1"
                                                    >
                                                        {row[column.id]}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>

                                    {isExpandable && expandedRow === rowIndex && expandData?.[rowIndex] && (
                                        <TableRow>
                                            <TableCell colSpan={filteredColumns.length} sx={{ p: 0, border: 'none', width: expandColumnWidth ? expandData?.[rowIndex] : 'auto' }}>
                                                <Box sx={{ px: 3, my: 2, width: '100%' }}>
                                                    <Typography sx={{ mb: 1, fontWeight: 600 }}>
                                                        {expandTableTitle}
                                                    </Typography>

                                                    <Table size="small">
                                                        <TableHead
                                                            sx={{
                                                                bgcolor: headerColor,
                                                                position: 'sticky',
                                                                top: 0,
                                                                zIndex: 1,
                                                            }}
                                                        >
                                                            <TableRow>
                                                                {expandColumn?.map((col, colIndex) => (
                                                                    <TableCell
                                                                        key={colIndex}
                                                                        sx={{
                                                                            width:
                                                                                expandColumnWidth && expandColumnWidth[colIndex]
                                                                                    ? expandColumnWidth[colIndex]
                                                                                    : 'auto',
                                                                        }}
                                                                    >
                                                                        {col.label}
                                                                    </TableCell>
                                                                ))}
                                                            </TableRow>
                                                        </TableHead>

                                                        <TableBody sx={{ bgcolor: bodyColor }}>
                                                            {expandData[rowIndex]?.map((expRow, i) => (
                                                                <TableRow key={i} hover>
                                                                    {expandColumn?.map((col, colIndex) => (
                                                                        <TableCell
                                                                            key={colIndex}
                                                                            sx={{
                                                                                width:
                                                                                    expandColumnWidth && expandColumnWidth[colIndex]
                                                                                        ? expandColumnWidth[colIndex]
                                                                                        : 'auto',
                                                                            }}
                                                                        >
                                                                            {expRow[col.id]}
                                                                        </TableCell>
                                                                    ))}
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    );
};

export default FCommonTable;
