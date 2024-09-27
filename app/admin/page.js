import React, { Suspense } from "react";
import { getServerSession } from "next-auth";
import { unstable_noStore } from "next/cache";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { ThemeProvider } from "@mui/material/styles";

import theme from "@theme";
import AdminLayout from "./layout";
import Loading from "@app/loading";
import Admin from "../components/Admin/Admin";
import { fetchAllCars, reFetchAllOrders } from "@utils/action";
import { MainContextProvider } from "@app/Context";

export default async function AdminPage(params) {
  const carsData = await fetchAllCars();
  const ordersData = await reFetchAllOrders();
  console.log("orders from admin/page.js (server) : ", ordersData);
  unstable_noStore();
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    redirect("/login?callbackUrl=/admin");
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <AdminLayout>
        <MainContextProvider carsData={carsData} ordersData={ordersData}>
          <Suspense fallback={<Loading />}>
            <div>Hello {session.user.name}</div>
            <Admin session={session} cars={carsData} orders={ordersData} />
          </Suspense>
        </MainContextProvider>
      </AdminLayout>
    </ThemeProvider>
  );
}
