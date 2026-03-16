import React, { useState } from 'react';
import moment from 'moment';
import { useDeleteExpense } from '@/hooks/index';
import { useGetExpenseData } from '@/hooks/index';
import { useSelector } from 'react-redux';
import POSTable, { RowType } from '@/components/POS/Common/POSTable';
import { t } from 'i18next';
import { Typography } from '@mui/material';
import POSDeleteModal from '@/components/POS/Common/POSDeleteModal';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import Permission from '@/utils/POS/Permission';
const DeleteIcon: string = require('@/assets/Delete.svg').default;

const ExpenseTable = () => {
    const { mutateAsync: deleteExpense } = useDeleteExpense();
    const [deleteData, setdeleteData] = useState({
        deleteModel: false,
        id: '',
    });
    const { data: ExpenseData, refetch, isFetching } = useGetExpenseData({});
    const setting = useSelector((state: any) => state?.settings?.data);
    const { isAllowed } = Permission();
    const DeleteExpense = async (id: string) => {
        await deleteExpense(id);
        refetch();
    };

    const columns = [
        {
            id: 'description',
            name: t('Setting.Description'),
            selector: (row: RowType) => (
                <Typography
                    sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {row.description}
                </Typography>
            ),
            sortable: false,
            width: '40%',
        },
        {
            id: 'employee',
            name: t('Setting.Employee'),
            selector: (row: RowType) => row.employee,
            sortable: false,
        },
        {
            id: 'department',
            name: t('POS.Depaertment'),
            selector: (row: RowType) => row.department,
            sortable: false,
        },
        {
            id: 'category',
            name: t('POS.Category'),
            selector: (row: RowType) => row.category,
            sortable: false,
        },
        {
            id: 'price',
            name: t('Common.Price'),
            selector: (row: RowType) => formatCurrency(row.price),
            sortable: false,
        },
        {
            id: 'time',
            name: t('Common.Time'),
            selector: (row: RowType) => row.time,
            sortable: false,
        },
        {
            id: 'goto',
            name: ' ',
            selector: (row: RowType) => row.goto,
            sortable: false,
        },
    ];

    const ExpenseFilterData = ExpenseData?.expenses?.map((val, index) => {
        return {
            id: val?.id,
            description: val?.description,
            employee: val?.employee?.name,
            department: setting?.profile?.name,
            category: val?.expenseCategory?.name,
            price: val?.amount,
            time: moment(val?.createdAt).format('DD/MM-YYYY HH:mm'),
            goto: (
                isAllowed('Expense', 'delete') && (
                    <img
                        src={DeleteIcon}
                        alt="delete"
                        color="error"
                        onClick={() => setdeleteData((prev) => ({ ...prev, deleteModel: true, id: val?.id }))}
                    />
                )
            ),
        };
    });

    return (
        <React.Fragment>
            <POSTable
                columns={columns}
                data={ExpenseFilterData || []}
                loading={isFetching}
                isServerSorting={false}
                defaultOrder="seqId"
            />
            {deleteData.deleteModel && (
                <POSDeleteModal
                    open={deleteData.deleteModel}
                    handleClose={() => {
                        setdeleteData((prev) => ({ ...prev, deleteModel: false }));
                    }}
                    description={t('POS.RemoveExpenseDesc')}
                    title={t('POS.RemoveExpense')}
                    onClickDismiss={() => {
                        setdeleteData((prev) => ({ ...prev, deleteModel: false }));
                    }}
                    onClickConfirm={() => {
                        DeleteExpense(deleteData.id);
                        setdeleteData((prev) => ({ ...prev, deleteModel: false }));
                    }}
                />
            )}
        </React.Fragment>
    );
};

export default ExpenseTable;
