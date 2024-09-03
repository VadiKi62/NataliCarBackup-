import Image from "next/image";
import React, { Suspense } from "react";
import styles from "./page.module.css";
import Feed from "@app/components/Feed";
import { unstable_noStore } from "next/cache";
import Loading from "@app/loading";
import { fetchAll } from "@utils/action";


export default async function Home ()
{
  unstable_noStore()
  const carsData = await fetchAll()

  return (
    <main style={{ position: "relative", minHeight: "100vh",  }}>
      {/* <div className={styles.description}>
        <p>
          Car Rent&nbsp;Site
        </p>
        <div>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/favicon.png"
              alt="BBQR Logo"
              className={styles.vercelLogo}
              width={100}
              height={100}
              priority
            />
          </a>
        </div>
      </div> */}

     <div >
      <h1>
        CARS FOR RENT </h1>

   </div> 

      <Suspense fallback={<Loading />}>
        <Feed  carsData={carsData} isMain />
      </Suspense>
    </main>
  );
}
