import * as React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import MuiSnackbar from "@mui/material/Snackbar";
import { snackbarContentClasses } from "@mui/material/SnackbarContent";
import Slide from "@mui/material/Slide";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import IconButton from "@mui/material/IconButton";
import WarningIcon from "@mui/icons-material/Warning";

const styles = ({ theme, isError }) => ({
  [`& .${snackbarContentClasses.root}`]: {
    backgroundColor: isError
      ? theme.palette.primary.red
      : theme.palette.secondary.background,
    color: isError ? "white" : theme.palette.text.red,
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
};

export default styled(Snackbar)(styles);
