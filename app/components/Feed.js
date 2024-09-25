"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { I18nextProvider } from "react-i18next";
import { Grid, CircularProgress, Container } from "@mui/material";
import { unstable_noStore } from "next/cache";
import CarPage from "@app/components/CarPage";
import theme from "@theme";
import Loading from "@app/loading";
import CarGrid from "./CarGrid";
import ScrollButton from "./common/ScrollButton";
import i from "@locales/i18n";
import Navbar from "@app/components/Navbar";
import Footer from "@app/components/Footer";
import { MainContextProvider } from "../Context";

function Feed({ children, ...props }) {
  unstable_noStore();

  return (
    <Suspense fallback={<Loading />}>
      <ThemeProvider theme={theme}>
        <I18nextProvider i18n={i}>
          <MainContextProvider
            carsData={props.carsData}
            ordersData={props.ordersData}
          >
            <Navbar />
            <Container sx={{ pt: { xs: 8, md: 10 } }}>
              {props?.carsData ? <CarGrid /> : <CarPage car={props?.car} />}
              {children}
            </Container>
            <Footer />
            <ScrollButton />
          </MainContextProvider>
        </I18nextProvider>
      </ThemeProvider>
    </Suspense>
  );
}

export default Feed;
