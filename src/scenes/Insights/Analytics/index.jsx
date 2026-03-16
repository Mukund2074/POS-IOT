import { Stack } from '@mui/material';
import React from 'react'
import FCommonTable from '../../../components/commonComponents/F_commonTable';
import { t } from 'i18next';
import FPrimaryHeading from '../../../components/commonComponents/F_PrimaryHeading';

export default function Analytics({ allData }) {

    if (!allData || allData.length === 0) return (<Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }} > <FPrimaryHeading text={t("Components.NoData")} /> </Stack>)
    
    const sortedApiData = allData && allData?.sort((a, b) => {
        if (a.utm_source === 'organic') return 1;
        if (b.utm_source === 'organic') return -1;
        return 0;
    })

    return (
        <Stack sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 1 }} >
            {sortedApiData && sortedApiData.map((data, index) => {

                const columns = [
                    { id: 'id', label: `${t('Common.ID')}`, sortable: true },
                    { id: 'name', label: `${t('Insights.CampaignName')}`, sortable: false },
                    { id: 'visits', label: `${t('Insights.Visits')}`, sortable: true },
                    { id: 'purchase', label: `${t('Insights.Purchase')}`, sortable: true },
                    { id: 'conversion', label: `${t('Insights.Conversion')} %`, sortable: true },
                ];

                const dataForColumn = data.data.map((item) => ({
                    id: item.utm_campaign,
                    name: item.utm_campaign,
                    visits: item.profilevisit || 0,
                    purchase: item.purchase || 0,
                    conversion: `${item.conversionRate} %` || 0,
                }));
                return (
                    <Stack key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>

                        <FPrimaryHeading sx={{ mt: index === 0 ? 2 : 6 }} fontColor={"#545454"} text={data.utm_source.charAt(0).toUpperCase() + data.utm_source.slice(1)} />
                        <FCommonTable
                            visibleColumns={['name', 'visits', 'purchase', 'conversion']}
                            defaultOrder="name"
                            columnWidths={{ name: '55%', visits: '15%', purchase: '15%', conversion: '15%' }}
                            loading={false}
                            columns={columns}
                            data={dataForColumn}
                        />
                    </Stack>
                );
            })
            }
        </Stack >
    )
}
