import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import DataGridOrders from "./DataGridOrders";
import DataGridCars from "./DataGridCars";

function index({ session, cars, orders }) {
  return (
    <div>
      <DataGridOrders cars={cars} orders={orders} />
      <DataGridCars cars={cars} orders={orders} />
    </div>
  );
}

export default index;
