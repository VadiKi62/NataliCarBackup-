"use client";
import React, { useState, useEffect, useRef,Suspense } from "react";
 import { useSearchParams } from "next/navigation";
import { ThemeProvider } from "@mui/material/styles";
import { I18nextProvider } from "react-i18next";

import { Grid, CircularProgress,Container } from "@mui/material";
// import Footer from "./Footer";
// import Navbar from "./Navbar";
import { unstable_noStore } from "next/cache";
// import ScrollButton from "./common/ScrollButton";

import theme from "@theme";
// import HeroLayout from "./Hero/HeroLayout";
// import Menu from "./Menu/Menu";
import Loading from "@app/loading";
import CarGrid from "./CarGrid";
import i from "@locales/i18n";

// import ContextWrapper from "@app/components/ContextWrapper";

// import { fetchRest, fetchMenu } from "@utils/actions";

function Feed({ children, ...props }) {
  unstable_noStore();
  const { carsData } = props;

  // const searchParams = useSearchParams();
  // const dev = searchParams.get("dev") || null;
  // const menuRef = useRef();
  // const headerRef = useRef();
    if (!carsData) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <ThemeProvider theme={theme}>
        <I18nextProvider i18n={i}>

          {/* <Navbar restData={restData} headerRef={headerRef} /> */}
          {/* <MainContent menuData={menuData} menuRef={menuRef} rest={restData} /> */}
          {/* <HeroLayout /> */}
          {/* <Menu
            menuData={menuData}
            menuRef={menuRef}
            headerRef={headerRef}
          ></Menu> */}
          { children }
          <CarGrid carsData={ carsData } />
          {/* <Footer rest={restData} />
          <ScrollButton /> */}
  
        </I18nextProvider>
      </ThemeProvider>
    </Suspense>
  );
}

export default Feed;
