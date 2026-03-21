import React, { useEffect, useState } from 'react';
import { t } from 'i18next';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { cnMerge } from '../../utils/cnMerge';
import RadixButton from './RadixButton';

export interface ColumnType {
    id: string;
    name: React.ReactNode;
    selector: (row: RowType, index: number) => React.ReactNode;
    sortable?: boolean;
    sortValue?: (row: RowType) => string | number | Date | boolean | null | undefined; // Optional function to extract raw value for sorting
    width?: string; // mapped to tailwind via arbitrary values
    rowColor?: (row: RowType) => string;
    fontSize?: string;
    textAlign?: 'left' | 'right' | 'center';
    columnLabelStyles?: string;
}

export interface RowType {
    id?: string | number;
    [key: string]: any;
}

export interface FooterCellType {
    columnId: string;
    content: React.ReactNode;
    colSpan?: number;
    className?: string;
}

export interface FooterRowType {
    cells: FooterCellType[];
    className?: string;
}

export interface TableProps {
    columns: ColumnType[];
    data: RowType[];
    loading?: boolean;
    onRowClick?: ((row: RowType) => void) | null;
    defaultOrder?: string;
    isServerSorting?: boolean;
    onSort?: (columnId: string) => void;
    serverSortOrder?: 'asc' | 'desc';
    rowColor?: (row: RowType) => string;
    maxHeight?: string;
    rowHeight?: string;
    footerRows?: FooterRowType[];
    className?: string;
}

const TailwindTable: React.FC<TableProps> = ({
    columns,
    data,
    loading = false,
    onRowClick = null,
    defaultOrder = '',
    isServerSorting = false,
    onSort = () => {},
    serverSortOrder = 'asc',
    rowColor = () => '',
    maxHeight,
    footerRows = [],
    className = '',
}) => {
    const [order, setOrder] = useState<'asc' | 'desc'>(serverSortOrder);
    const [orderBy, setOrderBy] = useState<string>(defaultOrder);
    const [sortedData, setSortedData] = useState<RowType[]>([]);
    const [noDataVisible, setNoDataVisible] = useState(false);

    useEffect(() => {
        setSortedData(data);
    }, [data]);

    // Sync internal state with props for server-side sorting
    useEffect(() => {
        if (isServerSorting) {
            setOrder(serverSortOrder);
            setOrderBy(defaultOrder);
        }
    }, [isServerSorting, serverSortOrder, defaultOrder]);

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
            return;
        }

        setSortedData((prev) =>
            [...prev].sort((a, b) => {
                // Use sortValue function if provided, otherwise try to get value from row by column.id
                let valA: string | number | Date | boolean | null | undefined;
                let valB: string | number | Date | boolean | null | undefined;

                if (column.sortValue) {
                    valA = column.sortValue(a);
                    valB = column.sortValue(b);
                } else {
                    // Fallback: try to get value directly from row using column.id
                    valA = a[column.id];
                    valB = b[column.id];
                }

                // Handle null/undefined values
                if (valA == null) valA = '';
                if (valB == null) valB = '';

                // Convert to comparable values
                let aStr: string;
                let bStr: string;

                if (valA instanceof Date) {
                    aStr = valA.getTime().toString();
                } else {
                    aStr = typeof valA === 'string' || typeof valA === 'number' ? valA.toString() : '';
                }

                if (valB instanceof Date) {
                    bStr = valB.getTime().toString();
                } else {
                    bStr = typeof valB === 'string' || typeof valB === 'number' ? valB.toString() : '';
                }

                // For numbers, compare numerically
                const aNum = Number(aStr);
                const bNum = Number(bStr);
                if (!isNaN(aNum) && !isNaN(bNum) && aStr !== '' && bStr !== '') {
                    return newOrder === 'asc' ? aNum - bNum : bNum - aNum;
                }

                // For strings, compare lexicographically
                return newOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
            }),
        );
    };

    const alignClass = (align?: ColumnType['textAlign']) => {
        if (align === 'right') return 'text-right';
        if (align === 'center') return 'text-center';
        return 'text-left';
    };

    return (
        <div
            className={cnMerge(
                'w-full rounded-md border-[1px] border-solid border-border-default bg-background-paper shadow-sm overflow-hidden',
                maxHeight && 'overflow-y-auto scrollbar-hidden',
                className,
            )}
            style={maxHeight ? { maxHeight } : undefined}
        >
            <table className="w-full table-fixed border-collapse">
                <thead className="sticky top-0 z-10 bg-background-secondary">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.id}
                                className={cnMerge(
                                    'px-5 py-4 text-xs font-normal leading-[18px] text-text-secondary whitespace-nowrap bg-background-subtle',
                                    alignClass(col.textAlign),
                                    col.columnLabelStyles,
                                )}
                                style={col.width ? { width: col.width } : undefined}
                            >
                                <div className="flex items-center gap-2">
                                    <span>{col.name}</span>
                                    {col.sortable && (
                                        <RadixButton
                                            variant="ghost"
                                            size="xs"
                                            onClick={() => handleSort(col)}
                                            iconOnly
                                            className="border-none"
                                            aria-label={
                                                orderBy === col.id
                                                    ? order === 'asc'
                                                        ? t('Common.SortAscending')
                                                        : t('Common.SortDescending')
                                                    : t('Common.Sort')
                                            }
                                        >
                                            {orderBy === col.id ? (
                                                order === 'asc' ? (
                                                    <ArrowUp className="w-4 h-4 text-text-secondary" />
                                                ) : (
                                                    <ArrowDown className="w-4 h-4 text-text-secondary" />
                                                )
                                            ) : (
                                                <ArrowUpDown className="w-4 h-4 text-text-secondary opacity-40" />
                                            )}
                                        </RadixButton>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {loading && (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className={cnMerge(' bg-background-paper py-32')}
                                style={{ verticalAlign: 'middle' }}
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-text-secondary">{t('Common.Loading')}...</span>
                                </div>
                            </td>
                        </tr>
                    )}

                    {!loading && sortedData.length === 0 && noDataVisible && (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className={cnMerge('py-32 text-center text-text-secondary bg-background-paper')}
                            >
                                {t('Components.NoData')}
                            </td>
                        </tr>
                    )}

                    {!loading &&
                        sortedData.map((row, rowIndex) => (
                            <tr
                                key={row.id ?? rowIndex}
                                onClick={onRowClick ? () => onRowClick(row) : undefined}
                                className={cnMerge(
                                    'transition-colors',
                                    rowIndex % 2 === 0 ? 'bg-background-paper' : 'bg-background-default',
                                    onRowClick && 'cursor-pointer hover:bg-background-secondary',
                                    'border-t border-solid border-border-default border-b-0 border-l-0 border-r-0',
                                )}
                            >
                                {columns.map((col) => (
                                    <td
                                        key={col.id}
                                        className={cnMerge(
                                            'border-b border-border-default px-5 py-4 text-sm text-text-secondary',
                                            alignClass(col.textAlign),
                                        )}
                                    >
                                        {col.selector(row, rowIndex)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                </tbody>

                {footerRows.length > 0 && (
                    <tfoot className="sticky bottom-0" style={{ backgroundColor: '#F8F8F8' }}>
                        {footerRows.map((footerRow, i) => (
                            <tr key={i} className={footerRow.className}>
                                {footerRow.cells.map((cell, j) => (
                                    <td
                                        key={j}
                                        colSpan={cell.colSpan}
                                        className={cnMerge(
                                            'px-5 py-4 text-sm font-bold text-text-primary',
                                            cell.className,
                                        )}
                                    >
                                        {cell.content}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tfoot>
                )}
            </table>
        </div>
    );
};

TailwindTable.displayName = 'TailwindTable';

export default TailwindTable;
