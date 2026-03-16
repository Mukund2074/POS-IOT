import React, { useState } from 'react';
import { Stack, Typography } from '@mui/material';
import FPrimaryHeading from '../../../commonComponents/F_PrimaryHeading';
import FCommonTable from '../../../commonComponents/F_commonTable';
import FButton from '../../../commonComponents/F_Button';
import AddNewJournalForm from './popup/AddNewJournalForm';
import moment from 'moment';
import { t } from 'i18next';
import { CollectionsOutlined } from '@mui/icons-material';

export default function TableView({
    setup,
    getAdvancedTemplates,
    customerAdvancedTemplates,
    setSelectedAdvancedJournalId,
    loading,
    setShow,
    customer,
}) {
    const [addNewJournalModal, setAddNewJournalModal] = useState(false);

    const columns = [
        { id: 'created', label: t('Common.Created'), sortable: true },
        { id: 'name', label: t('Common.Name'), sortable: true },
        { id: 'setup', label: t('Setting.Setup'), sortable: true },
        { id: 'updated_at', label: t('Common.LastEdited'), sortable: true },
        { id: 'created_by', label: t('Common.CreatedBy'), sortable: false },
        { id: 'advjn_status', label: t('Common.Status'), sortable: false },
        { id: 'journal_id', label: t('Common.JournalID'), sortable: false },
        { id: 'GoToComponent', label: t('Common.Edit'), sortable: false },
    ];

    const dataForTable = customerAdvancedTemplates?.map((item) => ({
        id: item.id,
        created: item.created_at ? moment.parseZone(item.created_at).format('DD/MM-YY HH:mm') : '',
        name: (
            <Typography>
                {item?.attachment_count > 0 && <CollectionsOutlined sx={{ mr: 2 }} />}
                {item?.title}
            </Typography>
        ),
        setup: item.template_name,
        updated_at: item.updated_at ? moment.parseZone(item.updated_at).format('DD/MM-YY HH:mm') : '',
        created_by: item.employee_name,
        advjn_status: item.completed ? (
            <Typography sx={{ color: '#367B3D' }}>{t('Common.Completed')}</Typography>
        ) : (
            <Typography sx={{ color: '#E19957' }}>{t('Common.Open')}</Typography>
        ),
        journal_id: item.id,
        GoToComponent: (
            <FButton
                onClick={() => {
                    setSelectedAdvancedJournalId(item);
                    setShow('Advanced');
                }}
                title={item.completed ? t('Common.View') : t('Common.Correct')}
                sx={{
                    width: '100%',
                    backgroundColor: item.completed ? '#D9D9D9' : '#E19957',
                    color: '#ffffff',
                }}
            />
        ), // The custom component for the GoTo column
    }));

    return (
        <Stack sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Stack sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <FPrimaryHeading fontSize={20} text={t('Customer.AdvancedJournal')} />

                <FButton
                    sx={{ ml: 'auto', bgcolor: '#44B904', width: { xs: '100%', md: 'auto' } }}
                    onClick={() => setAddNewJournalModal(true)}
                    variant={'save'}
                    title={`+ ${t('Customer.AddNewJournal')}`}
                />
            </Stack>

            <FCommonTable
                columns={columns}
                data={dataForTable}
                visibleColumns={[
                    'created',
                    'name',
                    'setup',
                    'updated_at',
                    'created_by',
                    'advjn_status',
                    'journal_id',
                    'GoToComponent',
                ]}
                columnWidths={{
                    created: '10%',
                    name: '20%',
                    setup: '15%',
                    updated_at: '10%',
                    created_by: '15%',
                    advjn_status: '10%',
                    journal_id: '10%',
                    GoToComponent: '10%',
                }}
                loading={loading}
                disableWrap={true}
            />

            {addNewJournalModal && (
                <AddNewJournalForm
                    setup={setup}
                    getAdvancedTemplates={getAdvancedTemplates}
                    customer={customer}
                    open={addNewJournalModal}
                    onClose={() => setAddNewJournalModal(false)}
                />
            )}
        </Stack>
    );
}
