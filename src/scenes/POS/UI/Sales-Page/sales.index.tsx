import React, { useEffect, useMemo, useState } from 'react';
import CreateSalesView from './UI/Create/CreateSalesView';
import ListAndFilter from './UI/Shared/ListAndFilter';
import SendReceiptModal from './UI/List/Modals/SendReceiptModal';

export default function SalesPageLayout() {
    const [open, setOpen] = useState(false);
    const [sendReceiptModalOpen, setSendReceiptModalOpen] = useState(false);
    const [saleData, setSaleData] = useState<{
        saleId: string;
        customerEmail?: string;
        customerName?: string;
    } | null>(null);
    const params = useMemo(() => new URLSearchParams(window.location.search), []);

    useEffect(() => {
        if (params.get('sellGiftCard')) {
            const newParams = new URLSearchParams(window.location.search);
            newParams.delete('sellGiftCard');

            // Update the URL without reloading the page
            window.history.replaceState(null, '', `${window.location.pathname}`);

            setOpen(true);
        }
    }, [params]);

    const handleSaleSuccess = (saleId: string, customerEmail?: string, customerName?: string) => {
        setSaleData({
            saleId,
            customerEmail,
            customerName,
        });
        setSendReceiptModalOpen(true);
    };

    const handleCloseSendReceiptModal = () => {
        setSendReceiptModalOpen(false);
        setSaleData(null);
    };

    return (
        <React.Fragment>
            <ListAndFilter setOpen={setOpen} />

            {open && <CreateSalesView open={open} onClose={() => setOpen(false)} onSaleSuccess={handleSaleSuccess} />}

            {sendReceiptModalOpen && saleData && (
                <SendReceiptModal
                    open={sendReceiptModalOpen}
                    onClose={handleCloseSendReceiptModal}
                    saleId={saleData.saleId}
                    customerEmail={saleData.customerEmail}
                    customerName={saleData.customerName}
                />
            )}
        </React.Fragment>
    );
}
