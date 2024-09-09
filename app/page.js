import Image from "next/image";
import React, { Suspense } from "react";
import Feed from "@app/components/Feed";

import { unstable_noStore } from "next/cache";
import Loading from "@app/loading";
import { fetchAll } from "@utils/action";
import CircleBg from "@app/components/common/CircleBg";

export default async function Home() {
  unstable_noStore();
  const carsData = await fetchAll();

  return (
    <>
      {" "}
      <CircleBg />
      <div
        style={{
          textAlign: "center",
          textTransform: "bold",
          marginBottom: "30px",
          marginTop: "30px",
        }}
      >
        <h1>CARS FOR RENT </h1>
      </div>
      <main>
        <Suspense fallback={<Loading />}>
          <Feed carsData={carsData} />
        </Suspense>
      </main>
    </>
  );
}
