"use client";
import React from "react";
import { Grid, Container, CircularProgress, Box } from "@mui/material";
import { useMainContext } from "@app/Context";
import DataGridOrders from "@app/components/Admin/DataGridOrders";

function Orders({ params }) {
  const {
    allOrders,
    setAllOrders,
    resubmitCars,
    cars,
    fetchAndUpdateOrders,
    deleteCarInContext,
    scrolled,
    isLoading,
    error,
  } = useMainContext();
  console.log(allOrders);
  console.log(cars);
  console.log(params.cars);
  return (
    <div>
      <DataGridOrders cars={cars} orders={allOrders} />
    </div>
  );
}

export default Orders;
