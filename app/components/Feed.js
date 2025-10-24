"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import darkTheme from "@theme";
import { I18nextProvider } from "react-i18next";
import { unstable_noStore } from "next/cache";

import Loading from "@app/loading";
import { Box } from "@mui/material";

import i from "@locales/i18n";
import { MainContextProvider } from "../Context";

import CarGrid from "./CarGrid";
import CarPage from "@app/components/CarPage";
import ScrollButton from "./common/ScrollButton";
// import BrowserLanguageInfo from "./common/BrowserLanguageInfo"; // Компонент для показа информации о языке
import Navbar from "@app/components/Navbar";
import Footer from "@app/components/Footer";

function Feed({ children, ...props }) {
  unstable_noStore();

  const shouldShowFooter = !props.isAdmin; // Скрываем Footer, если isAdmin === true

  // Quick fix: reduce main top padding for admin pages so content sits directly
  // under the fixed AppBar / admin topbar. Use a safe default (64px).
  const mainPt = props.isAdmin
    ? { xs: "0px", md: "0px" }
    : { xs: "110px", md: "90px" };

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setIsDarkMode(false);
    }
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <ThemeProvider theme={darkTheme}>
        <I18nextProvider i18n={i}>
          <MainContextProvider
            carsData={props.cars}
            ordersData={props.orders}
            companyData={props.company}
          >
            <Navbar isMain={props.isMain} isAdmin={props.isAdmin} />
            {/* main paddingTop keeps content below fixed Navbar + filters; responsive values */}
            <Box component="main" sx={{ pt: mainPt }}>
              {children}
            </Box>
            {shouldShowFooter && <Footer />}{" "}
            {/* Footer не отобразится, если isAdmin === true */}
            <ScrollButton />
            {/* <BrowserLanguageInfo /> */}{" "}
            {/* Показывает информацию о языке браузера только в development */}
          </MainContextProvider>
        </I18nextProvider>
      </ThemeProvider>
    </Suspense>
  );
}

export default Feed;
