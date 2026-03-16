import { DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import backButton from "../../assets/less.png";
export function FDialogTitle(props) {
  const { children, onClose,sx, onBack, ...other } = props;

  return (
    <DialogTitle
      sx={{
        m: 0,
        p: 2,
        width: "100%",
        justifyContent: "center",
        display: "flex",
        alignContent: "center",
        textAlign: "center",
        color: "#1F1F1F",
        fontWeight: 700,
        marginBottom: 2,
        ...sx
      }}
      {...other}
    >
      {onBack && (
        <IconButton
          aria-label="close"
          disableRipple
          sx={{
            position: "absolute",
            left: 8,
            
            color: "#6f6f6f",
          }}
          onClick={onBack}
        >
          <img src={backButton} alt="Back" />
        </IconButton>
      )}
      
      {children}
      {onClose ? (
        <IconButton
        disableRipple
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
           
            color: "#6f6f6f",
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}
