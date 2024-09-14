import React, { useState, useEffect } from "react";
import { Grid, Container, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useMainContext } from "../Context";

import CarItemComponent from "./CarItemComponent";

const Section = styled("div")(({ theme }) => ({
  backgroundColor: "transparent",
  textAlign: "center",
}));

function CarGrid() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cars, allOrders, ordersByCarId } = useMainContext();
  const [ordersData, setOrders] = useState(allOrders);
  //   if (loading) {
  //     return <CircularProgress />;
  //   }
  console.log("ordersData", ordersData);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Section>
      <Grid
        container
        spacing={{ sm: 2, sx: 0.4 }}
        direction="column"
        sx={{ alignItems: "center", alignContent: "center" }}
      >
        {cars.map((car) => (
          <Grid item xs={12} sx={{ padding: 2 }} key={car._id}>
            <CarItemComponent car={car} orders={ordersByCarId(car._id)} />
          </Grid>
        ))}
      </Grid>
    </Section>
  );
}

export default CarGrid;
