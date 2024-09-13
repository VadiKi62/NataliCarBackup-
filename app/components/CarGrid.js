import React, { useState, useEffect } from "react";
import { Grid, Container, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";

import CarItemComponent from "./CarItemComponent";

const Section = styled("div")(({ theme }) => ({
  backgroundColor: "transparent",
  textAlign: "center",
}));

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
    <Section>
      <Grid
        container
        spacing={{ sm: 2, sx: 0.4 }}
        direction="column"
        sx={{ alignItems: "center", alignContent: "center" }}
      >
        {carsData.map((car) => (
          <Grid item xs={12} sx={{ padding: 2 }} key={car._id}>
            <CarItemComponent car={car} />
          </Grid>
        ))}
      </Grid>
    </Section>
  );
}

export default CarGrid;
