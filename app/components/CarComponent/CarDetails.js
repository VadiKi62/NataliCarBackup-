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
import { useTranslation } from "react-i18next";

const CarTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  textTransform: "uppercase",
  fontWeight: 700,
  marginBottom: theme.spacing(1.7),
  marginTop: theme.spacing(2.5),
}));

const CarDetails = ({ car }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useTranslation();

  const additionalDetails = [
    {
      key: "registration",
      label: t("car.reg-year"),
      icon: "/icons/registration.png",
      getValue: (car) => car.registration,
    },
    {
      key: "regNumber",
      label: t("car.reg-numb"),
      icon: "/icons/regnumber.png",
      getValue: (car) => car.regNumber,
    },
    {
      key: "color",
      label: t("car.color"),
      icon: "/icons/color.png",
      getValue: (car) =>
        car.color ? car.color.charAt(0).toUpperCase() + car.color.slice(1) : "",
    },
    {
      key: "numberOfDoors",
      label: t("car.doors"),
      icon: "/icons/doors2.png",
      getValue: (car) => car.numberOfDoors,
    },
    {
      key: "enginePower",
      label: t("car.engine-pow"),
      icon: "/icons/engine_power.png",
      getValue: (car) => `${car.enginePower} HP`,
    },
    {
      key: "engine",
      label: t("car.engine"),
      icon: "/icons/engine.png",
      getValue: (car) => car.engine,
    },
  ];

  const defaultDetails = [
    {
      key: "class",
      label: t("car.class"),
      icon: "/icons/klass.png",
      getValue: (car) =>
        car.class ? car.class.charAt(0).toUpperCase() + car.class.slice(1) : "",
    },
    {
      key: "transmission",
      label: t("car.transmission"),
      icon: "/icons/transmission.png",
      getValue: (car) =>
        car.transmission
          ? car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1)
          : "",
    },
    {
      key: "fueltype",
      label: t("car.fuel"),
      icon: "/icons/fuel.png",
      getValue: (car) =>
        car.fueltype
          ? car.fueltype.charAt(0).toUpperCase() + car.fueltype.slice(1)
          : "",
    },
    {
      key: "seats",
      label: t("car.seats"),
      icon: "/icons/seat.png",
      getValue: (car) => car.seats,
    },
    {
      key: "airConditioning",
      label: t("car.air"),
      icon: "/icons/ac.png",
      getValue: (car) => car.airConditioning,
      showOnlyIfTrue: true,
    },
  ];

  const allDetails = [...additionalDetails, ...defaultDetails];

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
          alignItems: "center",
          px: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
            alignItems: "center",
            mb: 2,
          }}
        >
          {defaultDetails
            .filter((detail) => !detail.showOnlyIfTrue || detail.getValue(car))
            .map((detail) => (
              <Box
                key={detail.key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Image
                  src={detail.icon}
                  alt={detail.label}
                  width={20}
                  height={20}
                />
                {!detail.showOnlyIfTrue && (
                  <CarTypography variant="body2">
                    {detail.getValue(car)}
                  </CarTypography>
                )}
              </Box>
            ))}
        </Box>

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
