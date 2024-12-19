import React, { Suspense } from "react";
import { unstable_noStore } from "next/cache";
import { Box } from "@mui/material";
import { fetchAllCars, reFetchAllOrders } from "@utils/action";
import Feed from "@app/components/Feed";

import BigCalendar from "@app/components/Calendars/BigCalendar";
import Admin from "@app/components/Admin/Admin";

export default async function PageOrdersCalendar() {
  unstable_noStore();
  const carsData = await fetchAllCars();
  const ordersData = await reFetchAllOrders();
  return (
    <Suspense>
      <Feed cars={carsData} orders={ordersData} isAdmin={true} isMain={false}>
        <Box sx={{ my: 3 }}>
          <Admin isOrdersBigCalendar={true} />
        </Box>
      </Feed>
    </Suspense>
  );
}
