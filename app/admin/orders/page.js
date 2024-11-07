"use client";
import React from "react";
import { Grid, Container, CircularProgress, Box } from "@mui/material";
import { fetchAllCars, reFetchAllOrders } from "@utils/action";

import DataGridOrders from "@app/components/Admin/DataGridOrders";

async function pageOrders() {
  const carsData = await fetchAllCars();
  const ordersData = await reFetchAllOrders();
  return <DataGridOrders cars={carsData} orders={ordersData} />;
}

export default pageOrders;
