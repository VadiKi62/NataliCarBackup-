import React, { useState, useEffect } from "react";
import { Grid, Container, CircularProgress } from "@mui/material";

import CarItemComponent from "./CarItemComponent";

function CarGrid({ carsData }) {
  //   const [cars, setCars] = useState(carData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //   if (loading) {
  //     return <CircularProgress />;
  //   }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Grid container spacing={2} direction="column">
      {carsData.map((car) => (
        <Grid item xs={12} sx={{ padding: 1 }} key={car._id}>
          <CarItemComponent car={car} />
        </Grid>
      ))}
    </Grid>
  );
}

export default CarGrid;
