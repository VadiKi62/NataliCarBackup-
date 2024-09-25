import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import DataGridOrders from "./DataGridOrders";
import DataGridCars from "./DataGridCars";
import CarItemAdmin from "./CarItemAdmin";
import { Grid, Container, CircularProgress } from "@mui/material";

function index({ session, cars, orders }) {
  return (
    <div>
      {/* <DataGridOrders cars={cars} orders={orders} />
      <DataGridCars cars={cars} orders={orders} /> */}
      <Grid
        container
        spacing={{ sm: 2, sx: 0.4 }}
        direction="column"
        sx={{ alignItems: "center", alignContent: "center" }}
      >
        {cars
          .sort((a, b) => a.sort - b.sort)
          .map((car) => (
            <Grid item xs={12} sx={{ padding: 2 }} key={car._id}>
              <CarItemAdmin car={car} />
            </Grid>
          ))}
      </Grid>
    </div>
  );
}

export default index;
