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
  const { cars } = useMainContext();

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
            <CarItemComponent car={car} />
          </Grid>
        ))}
      </Grid>
    </Section>
  );
}

export default CarGrid;
