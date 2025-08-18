"use client";

import { MainContextProvider } from "./Context";
import { SnackbarProvider } from "notistack";
import { I18nextProvider } from "react-i18next";
import i18n from "../locales/i18n";

export default function Providers({ children }) {
  return (
    <I18nextProvider i18n={i18n}>
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
    </I18nextProvider>
  );
}
