import React, { Suspense } from "react";
import { unstable_noStore } from "next/cache";
import { Grid, Container, CircularProgress, Box } from "@mui/material";
import { fetchAllCars, reFetchAllOrders } from "@utils/action";
import Feed from "@app/components/Feed";

import BigCalendar from "@app/components/Calendars/BigCalendar";

export default async function PageOrdersCalendar() {
  unstable_noStore();
  const carsData = await fetchAllCars();
  const ordersData = await reFetchAllOrders();
  console.log(" FROM page : Orders Data:", ordersData);
  return (
    <Feed cars={carsData} orders={ordersData}>
      <BigCalendar cars={carsData} orders={ordersData} />
    </Feed>
  );
}
