import React, { useState, useEffect } from "react";
import { Grid, Container, CircularProgress } from "@mui/material";
import CarItemComponent from "./CarItemComponent"; // A new component we'll define for individual car items

function CarGrid({carsData}) {
//   const [cars, setCars] = useState(carData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    console.log( "the is from CAR GRID")
//   if (loading) {
//     return <CircularProgress />;
//   }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (

    <Container>
      <Grid container spacing={2} direction="column">
        {carsData.map((car) => (
          <Grid item xs={12} sx={{padding:1}} key={car._id} >
            <CarItemComponent car={car} />
          </Grid>
        ))}
      </Grid>
    </Container>

  );
}

export default CarGrid;
