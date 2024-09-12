import React, { useState } from "react";
import Link from "next/link";
import { styled } from "@mui/material/styles";
import {
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
  Stack,
  Divider,
  Box,
} from "@mui/material";
import Image from "next/image";
import ScrollingCalendar from "./ScrollingCalendar";
import { fetchCar } from "@utils/action";
import BookingModal from "./BookingModal";
import { fetchOrdersByCar } from "@utils/action";

const StyledCarItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  margin: 0,
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: theme.shadows[4],
  transition: "transform 0.3s",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[5],
  },
}));

const Wrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "center",
  },
}));

const CarImage = styled(Image)(({ theme }) => ({
  borderRadius: "8px",
  objectFit: "cover",
  //   border: `2px solid ${theme.palette.secondary.main}`,
  [theme.breakpoints.down("sm")]: {
    marginBottom: theme.spacing(2), // add spacing below the image
  },
}));

const CarDetails = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  marginLeft: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    marginLeft: 0, // reset margin for smaller screens
    textAlign: "center", // center text on smaller screens
  },
}));

const CarTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "black",
}));

const CarPrice = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

const CarInfo = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  color: "gray",
}));

function CarItemComponent({ car }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [modalOpen, setModalOpen] = useState(false);
  const [bookDates, setBookedDates] = useState({ start: null, end: null });
  const [carData, setCarData] = useState(car);
  const [ordersData, setOrders] = useState(car.orders);

  const fetchCarData = async (carId) => {
    const updatedCar = await fetchCar(carId);
    const updatedOrders = await fetchOrdersByCar(carId);
    setOrders(updatedOrders);
    setCarData(updatedCar);
  };
  // Extract unavailable dates from car orders
  // const getUnavailableDates = () => {
  //   if (!car.orders || car.orders.length === 0) {
  //     return { start: null, end: null };
  //   }

  //   // Sort orders by start date
  //   const sortedOrders = [...car.orders].sort(
  //     (a, b) => new Date(a.rentalStartDate) - new Date(b.rentalStartDate)
  //   );

  //   // Get the earliest start date and latest end date
  //   const start = sortedOrders[0].rentalStartDate;
  //   const end = sortedOrders[sortedOrders.length - 1].rentalEndDate;
  //   console.log(start);
  //   return { start, end };
  // };

  // const unavailableDates = getUnavailableDates();

  const handleBookingComplete = () => {
    setModalOpen(true);
  };

  return (
    <StyledCarItem>
      <Wrapper>
        <Link href={`/car/${car._id}`}>
          <CarImage
            src={car.photoUrl}
            alt={car.model}
            width={400}
            height={200}
          />
          <CarDetails>
            <CarTitle>{car.model}</CarTitle>
            <CarInfo>Class: {car.class}</CarInfo>
            <CarInfo>Transmission: {car.transmission}</CarInfo>
            <CarInfo>Doors: {car?.numberOfDoors}</CarInfo>
            <CarInfo>AC: {car?.airConditioning ? "Yes" : "No"}</CarInfo>
            <Stack
              direction="row"
              divider={
                <Divider orientation="vertical" flexItem color="primary.main" />
              }
              spacing={2}
              sx={{
                justifyContent: "center",
                display: "flex",
                fontSize: "2rem",
              }}
            >
              <CarPrice>Price: </CarPrice>
              {Object.entries(car?.pricingTiers).map(([days, price]) => (
                <Typography
                  key={days}
                  variant="body1"
                  component="p"
                  color="primary.main"
                >
                  {days}d+ €{price}
                </Typography>
              ))}
            </Stack>
          </CarDetails>
        </Link>
      </Wrapper>

      <ScrollingCalendar
        car={carData}
        orders={ordersData}
        setBookedDates={setBookedDates}
        onBookingComplete={handleBookingComplete}
      />
      <BookingModal
        onSuccessfulBooking={fetchCarData}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        car={car}
        presetDates={{ startDate: bookDates?.start, endDate: bookDates?.end }}
      />
    </StyledCarItem>
  );
}

export default CarItemComponent;
