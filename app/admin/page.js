import React, { Suspense } from "react";
import { getServerSession } from "next-auth";
import { unstable_noStore } from "next/cache";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ThemeProvider } from "@mui/material/styles";

import theme from "@theme";
import AdminLayout from "./layout";
import Loading from "@app/loading";
import Admin from "../components/Admin/Admin";
import { fetchAllCars, reFetchAllOrders } from "@utils/action";
import { MainContextProvider } from "@app/Context";
import Navbar from "@app/components/Navbar";
import DataGridOrders from "@app/components/Admin/DataGridOrders";
import Feed from "@app/components/Feed";

export default async function AdminPage({ children }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    redirect("/login?callbackUrl=/admin");
    return null;
  }

  const carsData = await fetchAllCars();
  const ordersData = await reFetchAllOrders();

  return (
    // <ThemeProvider theme={theme}>
    //   <AdminLayout>
    //     <MainContextProvider carsData={carsData} ordersData={ordersData}>
    //       <Suspense fallback={<Loading />}>
    <Feed carsData={carsData} ordersData={ordersData} isMain={false}>
      {/* <Navbar isAdmin={true} /> */}
      <Admin cars={carsData} orders={ordersData} />
      {/* <DataGridOrders cars={carsData} orders={ordersData} /> */}
      {children}
    </Feed>
    //      </Suspense>
    //     </MainContextProvider>
    //   </AdminLayout>
    // </ThemeProvider>
  );
}
