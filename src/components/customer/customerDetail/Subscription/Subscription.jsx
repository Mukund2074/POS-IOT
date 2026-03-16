import { Box } from '@mui/material';
import SubscriptionModal from '../../../calanderComponents/booking/subscriptionModal';
import { useParams } from 'react-router-dom';

const Subscription = () => {
    const params = useParams();

    return (
        <Box sx={{ py: 4 }}>
            <SubscriptionModal outletCustomerId={Number(params?.id)} />
        </Box>
    );
};

export default Subscription;
