import { Suspense } from "react";
import Loading from "@app/loading";
import AdminView from "./AdminView";
import { fetchAllCars, reFetchAllOrders, fetchCompany } from "@utils/action";

export default async function DataLoader({ viewType }) {
  const companyId = "679903bd10e6c8a8c0f027bc";

  // Запускаем загрузку параллельно
  const companyPromise = fetchCompany(companyId);
  const carsPromise = fetchAllCars();
  const ordersPromise = reFetchAllOrders();

  return (
    <Suspense fallback={<Loading />}>
      <AdminView
        company={await companyPromise}
        cars={await carsPromise}
        orders={await ordersPromise}
        viewType={viewType}
      />
    </Suspense>
  );
}
