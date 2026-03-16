import { styled } from "@mui/material/styles";
import Checkbox from "@mui/material/Checkbox";
import { Stack, Typography } from "@mui/material";

// Custom Checkmark Icon
function CheckIcon(props) {
  return (
    <svg width="10" height="" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.828125 4.25329L4.33246 7.60228L11.3535 0.904297" stroke="#44B904" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

// Base Checkbox Icon
const BpIcon = styled("span")(() => ({
  borderRadius: 5,
  width: 16,
  height: 16,
  border: "1px solid #DDE0F4",
  backgroundColor: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  ".Mui-focusVisible &": {
    outline: "2px auto rgba(19,124,189,.6)",
    outlineOffset: 2,
  },
  "input:hover ~ &": {
    backgroundColor: "#fff",
  },
  "input:disabled ~ &": {
    background: "rgba(206,217,224,.5)",
  },
}));

// Checked Checkbox Icon
const BpCheckedIcon = styled(BpIcon)({
  backgroundColor: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& svg": {
    width: 11,
    height: 14,
  },
});

// Custom Checkbox Component
export default function CustomCheckbox({ checked, label, onClick, sx, titleSx, ...props }) {
  return (
    <Stack
      onClick={() => onClick?.()}
      direction="row"
      alignItems="center"
      sx={{ cursor: 'pointer', width: 'fit-content', ...(sx || {}) }}
    >
      <Checkbox
        disableRipple
        checked={checked}
        checkedIcon={
          <BpCheckedIcon>
            <CheckIcon />
          </BpCheckedIcon>
        }
        icon={<BpIcon />}
        inputProps={{ 'aria-label': (label || '') }}
        {...props}
      />
      {typeof label === 'string' ?
        <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%', ...(titleSx || {}) }} >
          {label}
        </Typography>
        :
        label
      }
    </Stack>
  );
}
