import React, { useState } from "react";
import { Box, Typography, Grid, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import SpeedIcon from "@mui/icons-material/Speed";
// import PricingTiers from "./PricingTiers";
import Image from "next/image";
import CarDetailsModal from "./CarDetailsModal";
import CarTypography from "../common/CarTypography";

const CarTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  textTransform: "uppercase",
  fontWeight: 700,
  marginBottom: theme.spacing(1.7),
  marginTop: theme.spacing(2.5),
}));

const additionalDetails = [
  {
    key: "registration",
    label: "Registration Year",
    icon: "/icons/registration.png",
    getValue: (car) => car.registration,
  },
  {
    key: "regNumber",
    label: "Registration Number",
    icon: "/icons/regnumber.png",
    getValue: (car) => car.regNumber,
  },
  {
    key: "color",
    label: "Color",
    icon: "/icons/color.png",
    getValue: (car) => car.color,
  },
  {
    key: "numberOfDoors",
    label: "Number of Doors",
    icon: "/icons/doors2.png",
    getValue: (car) => car.numberOfDoors,
  },
  {
    key: "enginePower",
    label: "Engine Power",
    icon: "/icons/engine_power.png",
    getValue: (car) => `${car.enginePower} HP`,
  },
  {
    key: "engine",
    label: "Engine",
    icon: "/icons/engine.png",
    getValue: (car) => car.engine,
  },
];

const defaultDetails = [
  {
    key: "class",
    label: "Class",
    icon: "/icons/klass.png",
    getValue: (car) => car.class,
  },
  {
    key: "transmission",
    label: "Transmission",
    icon: "/icons/transmission.png",
    getValue: (car) => car.transmission,
  },
  {
    key: "fueltype",
    label: "Fuel Type",
    icon: "/icons/fuel.png",
    getValue: (car) => car.fueltype,
  },
  {
    key: "seats",
    label: "Seats",
    icon: "/icons/seat.png",
    getValue: (car) => car.seats,
  },
  {
    key: "airConditioning",
    label: "Air Conditioning",
    icon: "/icons/ac.png",
    getValue: (car) => (car.airConditioning ? "Yes" : "No"),
  },
];

const allDetails = [...additionalDetails, ...defaultDetails];

const CarDetails = ({ car }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <CarTitle sx={{ width: "60%", textAlign: "center" }} variant="h5">
        {car.model}
      </CarTitle>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          alignItems: "start",
          px: 3,
        }}
      >
        {defaultDetails.map((detail) => (
          <Grid item key={detail.key} mb={1}>
            <Grid container alignItems="center" mb={1}>
              <Grid item mr={1}>
                <Image
                  src={detail.icon}
                  alt={detail.label}
                  width={24}
                  height={24}
                />
              </Grid>
              <Grid item>
                <CarTypography>
                  {detail.label}: {detail.getValue(car)}
                </CarTypography>
              </Grid>
            </Grid>
          </Grid>
        ))}
        <Button
          onClick={() => setModalOpen(true)}
          variant="outlined"
          sx={{ mt: 2, mb: 1 }}
        >
          View More Details
        </Button>

        <CarDetailsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          car={car}
          additionalDetails={allDetails}
        />

        {/* <PricingTiers prices={car?.pricingTiers} /> */}
      </Box>
    </>
  );
};

export default CarDetails;
