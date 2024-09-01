"use client";
import Image from "next/image";
import React from "react";

function error() {
  return (
    <div className="loading-container">
      <h3 style={{ marginBottom: 20 }}>Ooops! error...</h3>{" "}
      <Image
        src="/logos/anim.gif"
        alt="bb qr code ki"
        width={130}
        height={130}
        unoptimized
      />
    </div>
  );
}

export default error;
