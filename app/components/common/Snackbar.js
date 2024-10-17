import React, { useEffect } from "react";
import { Slide, IconButton, Snackbar as MuiSnackbar } from "@mui/material";
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import PropTypes from "prop-types";
import { styled } from "@mui/system";
import { snackbarContentClasses } from "@mui/material/SnackbarContent";

const styles = ({ theme, isError }) => ({
  [`& .${snackbarContentClasses.root}`]: {
    backgroundColor: isError
      ? theme.palette.primary.red
      : theme.palette.text.green,
    color: isError ? "white" : theme.palette.text.dark,
    flexWrap: "inherit",
    [theme.breakpoints.up("md")]: {
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 4,
      borderBottomLeftRadius: 4,
    },
  },
  [`& .${snackbarContentClasses.message}`]: {
    fontSize: 16,
    display: "flex",
    alignItems: "center",
  },
  [`& .${snackbarContentClasses.action}`]: {
    paddingLeft: theme.spacing(2),
  },
  "& .MuiSnackbarContent-info": {
    flexShrink: 0,
    marginRight: theme.spacing(2),
  },
  "& .MuiSnackbarContent-close": {
    padding: theme.spacing(1),
  },
});

function Transition(props) {
  return <Slide {...props} direction="down" />;
}

function Snackbar(props) {
  const { message, closeFunc, isError, ...other } = props;
  const classes = {
    info: "MuiSnackbarContent-info",
    close: "MuiSnackbarContent-close",
  };

  // Automatically dismiss the Snackbar after 5 seconds (5000ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (closeFunc) {
        closeFunc(); // Call the close function after 5 seconds
      }
    }, 5000); // 5 seconds

    // Cleanup the timer when component unmounts or if Snackbar closes early
    return () => clearTimeout(timer);
  }, [closeFunc]);

  return (
    <MuiSnackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      autoHideDuration={6000}
      TransitionComponent={Transition}
      message={
        <>
          {isError ? (
            <WarningIcon className={classes.info} />
          ) : (
            <InfoIcon className={classes.info} />
          )}
          <span>{message}</span>
        </>
      }
      action={[
        <IconButton
          key="close"
          aria-label="close"
          color="inherit"
          className={classes.close}
          onClick={() => closeFunc && closeFunc()}
        >
          <CloseIcon />
        </IconButton>,
      ]}
      {...other}
    />
  );
}

Snackbar.propTypes = {
  isError: PropTypes.bool,
  message: PropTypes.string.isRequired,
  closeFunc: PropTypes.func.isRequired, // Ensure that the close function is required
};

export default styled(Snackbar)(styles);
