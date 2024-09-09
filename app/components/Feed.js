"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ThemeProvider } from "@mui/material/styles";
import { I18nextProvider } from "react-i18next";

import { Grid, CircularProgress, Container } from "@mui/material";
// import Footer from "./Footer";
// import Navbar from "./Navbar";
import { unstable_noStore } from "next/cache";
import CarPage from "@app/components/CarPage";
// import ScrollButton from "./common/ScrollButton";

import theme from "@theme";
// import HeroLayout from "./Hero/HeroLayout";
// import Menu from "./Menu/Menu";
import Loading from "@app/loading";
import CarGrid from "./CarGrid";
import i from "@locales/i18n";

function Feed({ children, ...props }) {
  unstable_noStore();
  const { carsData, car } = props;

  return (
    <Container sx={{ color: "transparent", width: "100%" }}>
      <Suspense fallback={<Loading />}>
        <ThemeProvider theme={theme}>
          <I18nextProvider i18n={i}>
            {children}
            {carsData ? <CarGrid carsData={carsData} /> : <CarPage car={car} />}
          </I18nextProvider>
        </ThemeProvider>
      </Suspense>
    </Container>
  );
}

export default Feed;
