import React, { Suspense } from "react";
import { Box } from "@mui/material";
import { unstable_noStore } from "next/cache";
import Feed from "@app/components/Feed";
import { fetchAllCars, reFetchAllOrders } from "@utils/action";
import DataGridOrders from "@app/components/Admin/DataGridOrders";
import Admin from "@app/components/Admin/Admin";

async function PageOrders() {
  unstable_noStore();
  const carsData = await fetchAllCars();
  const ordersData = await reFetchAllOrders();

  return (
    <Suspense>
      <Feed cars={carsData} orders={ordersData} isAdmin={true} isMain={false}>
        <Box sx={{ my: 3 }}>
          <Admin isOrdersCalendars={true} />
        </Box>
      </Feed>
    </Suspense>
  );
}

export default PageOrders;
