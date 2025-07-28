"use client";

import { MainContextProvider } from "./Context";
import { SnackbarProvider } from "notistack";

export default function Providers({ children }) {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      autoHideDuration={3000}
    >
      <MainContextProvider>{children}</MainContextProvider>
    </SnackbarProvider>
  );
}
