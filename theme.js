"use client";
import { createTheme } from "@mui/material/styles";

export default createTheme({
  palette: {
    primary: {
      main: "#317873",
      green: "#5f9ea0",
      fiolet: "#a0d6b4",
      red: "#733178",
    },
    secondary: {
      main: "#667b68",
      light: "rgba(160,214,180 0.70)",
      beige: "#fceee9",
      background: "rgba(163,193,173, 0.70)",
      complement: "#794957",
    },
    text: {
      light: "white",
      dark: "white",
      main: "	#a0d6b4",
      red: "#733178",
      green: "#a3c1ad",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        heroButton: {
          fontSize: 45,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          display: "inline-block",
          padding: "10px 28px",
          margin: "0px 2px 0px 0px",
          borderRadius: "50px",
          transition: "0.3s",
          lineHeight: 1,
          color: "white",
          border: "2px solid #cda45e",
          "&:hover": {
            backgroundColor: "#cda45e",
            color: "#fff",
          },
        },
      },
    },
  },

  typography: {
    fontFamily: ["Roboto Slab", "serif"].join(","),
    h1: {
      fontSize: "45px",
      fontFamily: ["B612 Mono", "monospace"].join(","),
    },
    allVariants: {
      fontFamily: ["B612 Mono", "monospace"].join(","),
    },
  },
});
