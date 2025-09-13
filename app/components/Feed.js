"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { I18nextProvider } from "react-i18next";
import { unstable_noStore } from "next/cache";

import theme from "@theme";
import Loading from "@app/loading";

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

  return (
    <Suspense fallback={<Loading />}>
      <ThemeProvider theme={theme}>
        <I18nextProvider i18n={i}>
          <MainContextProvider
            carsData={props.cars}
            ordersData={props.orders}
            companyData={props.company}
          >
            <Navbar isMain={props.isMain} isAdmin={props.isAdmin} />
            <main>{children}</main>
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
