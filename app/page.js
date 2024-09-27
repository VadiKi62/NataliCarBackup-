import React, { Suspense } from "react";
import Feed from "@app/components/Feed";

import { unstable_noStore } from "next/cache";
import Loading from "@app/loading";
import { fetchAllCars, reFetchAllOrders } from "@utils/action";
import CircleBg from "@app/components/common/CircleBg";

export default async function Home() {
  unstable_noStore();
  const carsData = await fetchAllCars();
  const ordersData = await reFetchAllOrders();
  console.log("orders from page.js (server) : ", ordersData);
  return (
    <Suspense fallback={<Loading />}>
      {" "}
      <CircleBg />
      <Suspense fallback={<Loading />}>
        <Feed carsData={carsData} ordersData={ordersData} />
      </Suspense>
    </Suspense>
  );
}
