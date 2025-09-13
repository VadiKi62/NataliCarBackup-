"use client";
import React, { useState, useEffect } from "react";
import { Grid, Container, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";

import { useMainContext } from "../Context";
import Feed from "./Feed";
import CarItemComponent from "./CarComponent/CarItemComponent";

const Section = styled("section")(({ theme }) => ({
  backgroundColor: "transparent",
  textAlign: "center",
}));

import dayjs from "dayjs";

function CarGrid() {
  const { cars, company, selectedClass, selectedTransmission } =
    useMainContext(); // Добавляем selectedTransmission
  const [filteredCars, setFilteredCars] = useState(cars);

  // --- Состояния для скидки ---
  const [discount, setDiscount] = useState(null);
  const [discountStart, setDiscountStart] = useState(null);
  const [discountEnd, setDiscountEnd] = useState(null);

  useEffect(() => {
    async function fetchDiscount() {
      try {
        const res = await fetch("/api/discount");
        if (!res.ok) throw new Error("Ошибка загрузки скидки");
        const data = await res.json();
        setDiscount(data.discount || null);
        setDiscountStart(data.startDate ? dayjs(data.startDate) : null);
        setDiscountEnd(data.endDate ? dayjs(data.endDate) : null);
      } catch (err) {
        // Ошибка загрузки скидки
      }
    }
    fetchDiscount();
  }, []);

  // Filter cars by the selected class and transmission
  useEffect(() => {
    const updatedCars = cars
      .filter(
        (car) =>
          // Фильтр по классу
          (selectedClass === "All" || car.class === selectedClass) &&
          // Фильтр по коробке передач
          (selectedTransmission === "All" ||
            car.transmission === selectedTransmission)
      )
      .sort((a, b) => a.model.localeCompare(b.model)); // Sort the filtered cars
    setFilteredCars(updatedCars);
  }, [selectedClass, selectedTransmission, cars]); // Добавляем selectedTransmission в зависимости

  return (
    <Container sx={{ paddingTop: { xs: 28, md: 20 } }}>
      <Section>
        <Grid
          container
          spacing={{ sm: 2, sx: 0.4 }}
          direction="column"
          sx={{ alignItems: "center", alignContent: "center" }}
        >
          {filteredCars?.map((car) => (
            <Grid item xs={12} sx={{ padding: 2 }} key={car._id}>
              <CarItemComponent
                car={car}
                discount={discount}
                discountStart={discountStart}
                discountEnd={discountEnd}
              />
            </Grid>
          ))}
        </Grid>
      </Section>
    </Container>
  );
}

export default CarGrid;
