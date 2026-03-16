import { styled } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 43,
  height: 22,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(20px)',
      color: '#fff', // White thumb
      '& + .MuiSwitch-track': {
        backgroundColor: '#65C466', // Green background
        opacity: 1,
        border: 0,
      },
    },
    '&.Mui-disabled': {
      opacity: 0.7,
      color: '#fff', // white thumb for disabled
      '& + .MuiSwitch-track': {
        backgroundColor: '#c2cccc', // dark gray background for disabled
      },
    },
  },
  '& .MuiSwitch-thumb': {
    width: 18,
    height: 18,
    boxSizing: 'border-box',
    backgroundColor: '#fff', // White thumb
  },
  '& .MuiSwitch-track': {
    borderRadius: 15,
    backgroundColor: '#E9E9EA', // Default gray background
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

export default function FSwitch({ label, checked, onChange, sx, id, name, inputProps, disabled, ...props }) {
  return (
    <FormControlLabel
      control={<IOSSwitch sx={{ m: 1 }} checked={checked} onChange={onChange} disabled={disabled} />}
      label={label}
      id={id}
      name={name}
      {...props}
      sx={sx}
    />
  );
}
