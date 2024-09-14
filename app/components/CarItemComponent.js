import React, { useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Paper,
  Box,
  Typography,
  Stack,
  Divider,
  Chip,
  IconButton,
  Collapse,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import SpeedIcon from "@mui/icons-material/Speed";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ScrollingCalendar from "./ScrollingCalendar";
import { fetchCar } from "@utils/action";
import { fetchOrdersByCar } from "@utils/action";
import BookingModal from "./BookingModal";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import CalendarPicker from "./CalendarPicker";
import { useMainContext } from "@app/Context";

const StyledCarItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  maxWidth: 400,
  zIndex: 22,
  display: "flex",
  justifyContent: "center",
  bgColor: "black",
  alignItems: "center",
  alignContent: "center",
  flexDirection: "column",
  boxShadow: theme.shadows[4],
  transition: "transform 0.3s",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[5],
  },
  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 750,
    padding: theme.spacing(5),
  },
}));

const Wrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const CarImage = styled(Box)(({ theme }) => ({
  position: "relative",
  width: 300,
  height: 200,
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  marginBottom: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    width: 450,
    height: 300,
    marginBottom: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
}));

const CarDetails = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
}));

const CarTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: 700,
  marginBottom: theme.spacing(1),
}));

const CarInfo = styled(Typography)(({ theme }) => ({
  fontSize: "0.9rem",
  color: theme.palette.text.secondary,
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(0.5),
  "& svg": {
    marginRight: theme.spacing(1),
    fontSize: "1.1rem",
  },
}));

const PriceChip = styled(Chip)(({ theme }) => ({
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const ExpandButton = styled(IconButton)(({ theme, expanded }) => ({
  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

function CarItemComponent({ car, orders }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [expanded, setExpanded] = useState(false);
  const [bookDates, setBookedDates] = useState({ start: null, end: null });
  const [carData, setCarData] = useState(car);
  const [modalOpen, setModalOpen] = useState(false);
  const { resubmitOrdersData, isLoading } = useMainContext();
  // const [ordersData, setOrders] = useState(orders);

  if (orders.length > 0) {
    console.log("CAR FROM CARITEM COMPONENT", car.model);
    console.log("ORDERS FROM CARITEM COMPONENT", orders);
  }

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleBookingComplete = () => {
    setModalOpen(true);
  };

  return (
    <StyledCarItem elevation={3}>
      <Wrapper>
        <CarImage>
          <Image
            src={car.photoUrl}
            alt={car.model}
            layout="fill"
            objectFit="cover"
          />
        </CarImage>
        <CarDetails>
          <CarTitle variant="h5">{car.model}</CarTitle>
          <Box mb={2}>
            <CarInfo>
              <DirectionsCarIcon /> Class: {car.class}
            </CarInfo>
            <CarInfo>
              <TimeToLeaveIcon />
              Transmission: {car.transmission}
            </CarInfo>
            <CarInfo>
              {" "}
              <TimeToLeaveIcon />
              Doors: {car?.numberOfDoors}
            </CarInfo>
            <CarInfo>
              <AcUnitIcon /> AC: {car?.airConditioning ? "Yes" : "No"}
            </CarInfo>
            <CarInfo>
              <SpeedIcon /> Engine Power: {car?.enginePower}
            </CarInfo>
          </Box>
          <Box mb={2}>
            {Object.entries(car?.pricingTiers).map(([days, price]) => (
              <PriceChip
                key={days}
                label={`${days}d+ €${price}`}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            {/* <Link href={`/car/${car._id}`} passHref>
            <Typography component="a" color="primary" variant="button">
              View Details
            </Typography>
          </Link>
          <ExpandButton
            expanded={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandButton> */}
          </Box>
          {/* <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              {car.description || "No additional description available."}
            </Typography>
          </Box>
        </Collapse> */}
        </CarDetails>
      </Wrapper>
      {/* <ScrollingCalendar
        car={car}
        orders={ordersData}
        setBookedDates={setBookedDates}
        onBookingComplete={handleBookingComplete}
      /> */}
      {isLoading ? (
        <Typography variant="body2" color="text.secondary">
          Loading orders...
        </Typography>
      ) : (
        <CalendarPicker
          car={car}
          orders={orders}
          setBookedDates={setBookedDates}
          onBookingComplete={handleBookingComplete}
        />
      )}
      <BookingModal
        onSuccessfulBooking={resubmitOrdersData}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        car={car}
        presetDates={{ startDate: bookDates?.start, endDate: bookDates?.end }}
      />
    </StyledCarItem>
  );
}

export default CarItemComponent;
