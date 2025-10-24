import React, { Suspense } from "react";
import { unstable_noStore } from "next/cache";
import Loading from "@app/loading";
import Feed from "@app/components/Feed";
import Admin from "../components/Admin/Admin";
import { fetchAllCars, reFetchAllOrders, fetchCompany } from "@utils/action";

export default async function PageOrdersCalendar() {
  unstable_noStore();

  // загружаем данные
  const [carsData, ordersData] = await Promise.all([
    fetchAllCars(),
    reFetchAllOrders(),
  ]);

  const companyId = "679903bd10e6c8a8c0f027bc";
  const company = await fetchCompany(companyId);

  // ⚡ Suspense должен оборачивать клиентскую часть, не async-загрузку
  return (
    <Suspense fallback={<Loading />}>
      <Feed
        cars={carsData}
        order={ordersData}
        company={company}
        isMain={false}
        isAdmin={true}
      >
        <Admin isCars />
      </Feed>
    </Suspense>
  );
}
