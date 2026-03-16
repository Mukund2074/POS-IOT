import React, { useEffect, useState } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    Stack,
    CircularProgress,
    SxProps,
} from '@mui/material';
import { ArrowDropDownRounded, ArrowDropUpRounded } from '@mui/icons-material';

export interface ColumnType {
    id: string;
    name: string;
    selector: (row: RowType, index: number) => React.ReactNode;
    sortable?: boolean;
    width?: string;
    rowColor?: (row: RowType) => string;
    fontSize?: string;
    textAlign?: 'left' | 'right' | 'center';
    columnLabelStyles?: SxProps;
}

export interface RowType {
    id?: string | number;
    [key: string]: any;
}

export interface FooterCellType {
    columnId: string;
    content: React.ReactNode;
    colSpan?: number;
    sx?: SxProps;
}

export interface FooterRowType {
    cells: FooterCellType[];
    sx?: SxProps;
}

export interface POSTableProps {
    columns: ColumnType[];
    data: RowType[];
    loading?: boolean;
    onRowClick?: (row: RowType) => void;
    headerColor?: string;
    bodyColor?: string;
    defaultOrder?: string;
    isServerSorting?: boolean;
    onSort?: (columnId: string) => void;
    serverSortOrder?: 'asc' | 'desc';
    rowColor?: (row: RowType) => string;
    maxHeight?: string;
    rowHeight?: string;
    keepRelative?: boolean;
    footerRows?: FooterRowType[];
}

const POSTable: React.FC<POSTableProps> = ({
    columns,
    data,
    loading = false,
    onRowClick = () => {},
    headerColor = '#e6e6e6',
    bodyColor = '#fff',
    defaultOrder = '',
    isServerSorting = false,
    onSort = () => {},
    serverSortOrder = 'asc',
    rowColor = () => '#fff',
    rowHeight = 'auto',
    maxHeight = 'auto',
    keepRelative = true,
    footerRows = [],
}) => {
    const [order, setOrder] = useState<'asc' | 'desc'>(serverSortOrder);
    const [orderBy, setOrderBy] = useState<string>(defaultOrder);
    const [sortedData, setSortedData] = useState<RowType[]>([]);
    const [noDataVisible, setNoDataVisible] = useState(false);

    useEffect(() => {
        setSortedData(data);
    }, [data]);

    useEffect(() => {
        if (!loading && sortedData.length === 0) {
            const timeout = setTimeout(() => setNoDataVisible(true), 500);
            return () => clearTimeout(timeout);
        }
        setNoDataVisible(false);
    }, [loading, sortedData]);

    const handleSort = (column: ColumnType) => {
        const isAsc = orderBy === column.id && order === 'asc';
        const newOrder = isAsc ? 'desc' : 'asc';
        setOrder(newOrder);
        setOrderBy(column.id);

        if (isServerSorting) {
            onSort(column.id);
        } else {
            setSortedData((prev) =>
                [...prev].sort((a, b) => {
                    const valA = column.selector(a, 0);
                    const valB = column.selector(b, 0);
                    const strA = typeof valA === 'string' || typeof valA === 'number' ? valA.toString() : '';
                    const strB = typeof valB === 'string' || typeof valB === 'number' ? valB.toString() : '';
                    return newOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
                }),
            );
        }
    };

    const containerStyles = {
        width: '100%',
        borderRadius: 4,
        overflowX: 'scroll',
        scrollbarWidth: 'none',
        position: keepRelative ? 'relative' : '',
        maxHeight,
        overflowY: 'scroll',
    };

    const renderTable = (rows: RowType[], wrapper?: boolean) => {
        const table = (
            <Table
                component={wrapper ? 'table' : Paper} // Paper only when not wrapped
                sx={!wrapper ? containerStyles : undefined}
            >
                <TableHead sx={{ backgroundColor: headerColor, position: 'sticky', top: 0, zIndex: 5 }}>
                    <TableRow>
                        {columns.map((col) => (
                            <TableCell key={col.id} sx={{ width: col.width || 'auto' }}>
                                <Stack direction="row" alignItems="center" sx={col.columnLabelStyles}>
                                    <Typography fontWeight={700}>{col.name}</Typography>
                                    {col.sortable && (
                                        <IconButton size="small" onClick={() => handleSort(col)}>
                                            {orderBy === col.id ? (
                                                order === 'asc' ? (
                                                    <ArrowDropDownRounded />
                                                ) : (
                                                    <ArrowDropUpRounded />
                                                )
                                            ) : (
                                                <ArrowDropDownRounded sx={{ opacity: 0.3 }} />
                                            )}
                                        </IconButton>
                                    )}
                                </Stack>
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>

                <TableBody sx={{ backgroundColor: bodyColor }}>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} align="center">
                                <CircularProgress size={24} />
                            </TableCell>
                        </TableRow>
                    ) : rows.length === 0 && noDataVisible ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} align="center">
                                <Typography>No data</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((row, index) => (
                            <TableRow
                                key={row.id}
                                hover
                                onClick={() => onRowClick(row)}
                                sx={{
                                    cursor: 'pointer',
                                    height: rowHeight,
                                    '& > .MuiTableCell-root': {
                                        height: rowHeight,
                                        padding: rowHeight !== 'auto' ? '4px 16px' : '16px',
                                    },
                                }}
                            >
                                {columns.map((col) => (
                                    <TableCell
                                        key={col.id}
                                        sx={{
                                            width: 'fit-content',
                                            backgroundColor: col.rowColor?.(row) || rowColor(row),
                                            fontSize: col.fontSize || '1rem',
                                        }}
                                    >
                                        {col.selector(row, index)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
                {footerRows.length > 0 && (
                    <TableFooter sx={{ position: 'sticky', bottom: 0, zIndex: 2, backgroundColor: bodyColor }}>
                        {footerRows.map((footerRow, index) => (
                            <TableRow key={`footer-${index}`} sx={footerRow.sx}>
                                {footerRow.cells.map((cell, cellIndex) => {
                                    const columnIndex = columns.findIndex((col) => col.id === cell.columnId);
                                    if (columnIndex === -1) return null;

                                    return (
                                        <TableCell
                                            key={`footer-cell-${cellIndex}`}
                                            colSpan={cell.colSpan}
                                            sx={{
                                                textAlign: columns[columnIndex].textAlign || 'left',
                                                fontSize: columns[columnIndex].fontSize || '1rem',
                                                ...cell.sx,
                                            }}
                                        >
                                            {cell.content}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableFooter>
                )}
            </Table>
        );

        return wrapper ? (
            <TableContainer id="scrollableDiv" component={Paper} sx={containerStyles}>
                {table}
            </TableContainer>
        ) : (
            table
        );
    };

    return renderTable(sortedData, keepRelative);
};

export default POSTable;
