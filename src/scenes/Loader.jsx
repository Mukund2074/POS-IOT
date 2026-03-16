import CircularProgress from '@mui/material/CircularProgress';
import { Stack } from '@mui/material';


const Loader =() => {


    return (
        <Stack sx={{ position: 'absolute',
            zIndex:110,
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.1)'}}>
            <CircularProgress size='2.5rem' sx={{color: '#6f6f6f'}}  />
        </Stack>
    )
}


export default Loader