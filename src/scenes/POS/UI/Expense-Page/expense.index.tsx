import React, { useState } from 'react';
import POSHeading from '../../../../components/POS/Common/POSHeading';
import POSButton from '../../../../components/POS/Common/POSButton';
import { Stack } from '@mui/material';
import { t } from 'i18next';
import POSDeleteModal from '../../../../components/POS/Common/POSDeleteModal';
import CreateExpenseModal from './UI/Forms/Create/CreateExpenseModal';
// import CustomDeleteModal from '../../../components/deleteAlertModal';
import ExpenseTable from './UI/List/ExpenseList';
import Permission, { PermissionDenied } from '@/utils/POS/Permission';

const ExpenseLayout = () => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { isAllowed } = Permission();
    return (
        <Stack>
            <Stack
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: { md: 'space-between' },
                    alignItems: 'center',
                    pb: 2,
                }}
            >
                <POSHeading sx={{ my: 2 }} text={t('POS.ExpenseHeader')} />

                {isAllowed('Expense', 'create') && (
                    <POSButton
                        title={`+ ${t('POS.CreateExpense')}`}
                        variant={'save'}
                        width={{ xs: '100%', md: 'auto' }}
                        onClick={() => {
                            setShowCreateModal(true);
                        }}
                    />
                )}
            </Stack>
            {isAllowed('Expense', 'read') ? <ExpenseTable /> : <PermissionDenied />}

            {showDeleteModal && (
                <POSDeleteModal
                    open={showDeleteModal}
                    handleClose={() => setShowDeleteModal(false)}
                    title="Delete Expense"
                    description={'Are you sure you want to delete this expense?'}
                    onClickDismiss={() => setShowDeleteModal(false)}
                    onClickConfirm={() => {
                        setShowDeleteModal(false);
                    }}
                />
            )}

            {showCreateModal && <CreateExpenseModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />}
        </Stack>
    );
};

export default ExpenseLayout;
