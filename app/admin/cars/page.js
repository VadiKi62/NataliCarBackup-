import React, { Suspense } from "react";
import Cars from "@app/components/Admin/Car/Cars";
import Admin from "@app/components/Admin/Admin";
import Feed from "@app/components/Feed";
import { fetchAllCars, reFetchAllOrders } from "@utils/action";

async function PageCars() {
  const carsData = await fetchAllCars();
  const ordersData = await reFetchAllOrders();
  return (
    <Suspense>
      <Feed cars={carsData} orders={ordersData} isAdmin={true} isMain={false}>
        <Admin isCars={true} />
      </Feed>
    </Suspense>
  );
}

export default PageCars;
