// import React, { useState } from "react";
// import Link from "next/link";
// import { styled } from "@mui/material/styles";
// import {
//   Paper,
//   Typography,
//   useMediaQuery,
//   useTheme,
//   Stack,
//   Divider,
//   Box,
// } from "@mui/material";
// import Image from "next/image";
// import ScrollingCalendar from "./ScrollingCalendar";
// import { fetchCar } from "@utils/action";
// import BookingModal from "./BookingModal";
// import { fetchOrdersByCar } from "@utils/action";

// const StyledCarItem = styled(Paper)(({ theme }) => ({
//   padding: theme.spacing(2),
//   maxWidth: 400,
//   zIndex: 22,
//   display: "flex",
//   justifyContent: "space-between",
//   alignItems: "center",
//   alignContent: "center",
//   flexDirection: "column",
//   boxShadow: theme.shadows[4],
//   transition: "transform 0.3s",
//   "&:hover": {
//     transform: "scale(1.02)",
//     boxShadow: theme.shadows[5],
//   },
//   [theme.breakpoints.up("md")]: {
//     flexDirection: "row",
//     alignItems: "center",
//     minWidth: 700,
//   },
// }));

// const Wrapper = styled(Box)(({ theme }) => ({
//   display: "flex",
//   [theme.breakpoints.down("sm")]: {
//     flexDirection: "column",
//     alignItems: "center",
//   },
// }));

// const CarImage = styled(Image)(({ theme }) => ({
//   borderRadius: "8px",
//   objectFit: "cover",
//   //   border: `2px solid ${theme.palette.secondary.main}`,
//   [theme.breakpoints.down("sm")]: {
//     marginBottom: theme.spacing(2), // add spacing below the image
//   },
// }));

// const CarDetails = styled("div")(({ theme }) => ({
//   display: "flex",
//   flexDirection: "column",
//   alignItems: "flex-start",
//   marginLeft: theme.spacing(2),
//   [theme.breakpoints.down("sm")]: {
//     marginLeft: 0, // reset margin for smaller screens
//     textAlign: "center", // center text on smaller screens
//   },
// }));

// const CarTitle = styled(Typography)(({ theme }) => ({
//   fontSize: "1.5rem",
//   fontWeight: 700,
//   color: "black",
//   maxWidth: "calc(100% - 50px)",
// }));

// const CarPrice = styled(Typography)(({ theme }) => ({
//   color: theme.palette.primary.main,
// }));

// const CarInfo = styled(Typography)(({ theme }) => ({
//   fontSize: "1rem",
//   color: "gray",
// }));

// function CarItemComponent({ car }) {
//   const theme = useTheme();
//   const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

//   const [modalOpen, setModalOpen] = useState(false);
//   const [bookDates, setBookedDates] = useState({ start: null, end: null });
//   const [carData, setCarData] = useState(car);
//   const [ordersData, setOrders] = useState(car.orders);

//   const fetchCarData = async (carId) => {
//     const updatedCar = await fetchCar(carId);
//     const updatedOrders = await fetchOrdersByCar(carId);
//     setOrders(updatedOrders);
//     setCarData(updatedCar);
//   };

//   const handleBookingComplete = () => {
//     setModalOpen(true);
//   };

//   return (
//     <StyledCarItem>
//       <Wrapper>
//         <Link href={`/car/${car._id}`}>
//           <CarImage
//             src={car.photoUrl}
//             alt={car.model}
//             width={350}
//             height={190}
//           />
//           <CarDetails>
//             <CarTitle>{car.model}</CarTitle>
//             <CarInfo>Class: {car.class}</CarInfo>
//             <CarInfo>Transmission: {car.transmission}</CarInfo>
//             <CarInfo>Doors: {car?.numberOfDoors}</CarInfo>
//             <CarInfo>AC: {car?.airConditioning ? "Yes" : "No"}</CarInfo>
//             <CarInfo>Engine Power : {car?.enginePower}</CarInfo>
//             <Stack
//               direction="row"
//               divider={
//                 <Divider orientation="vertical" flexItem color="primary.main" />
//               }
//               spacing={2}
//               sx={{
//                 justifyContent: "center",
//                 display: "flex",
//                 fontSize: "2rem",
//               }}
//             >
//               <CarPrice>Price: </CarPrice>
//               {Object.entries(car?.pricingTiers).map(([days, price]) => (
//                 <Typography
//                   key={days}
//                   variant="body1"
//                   component="p"
//                   color="primary.main"
//                 >
//                   {days}d+ €{price}
//                 </Typography>
//               ))}
//             </Stack>
//           </CarDetails>
//         </Link>
//       </Wrapper>

//       <ScrollingCalendar
//         car={carData}
//         orders={ordersData}
//         setBookedDates={setBookedDates}
//         onBookingComplete={handleBookingComplete}
//       />
//       <BookingModal
//         onSuccessfulBooking={fetchCarData}
//         open={modalOpen}
//         onClose={() => setModalOpen(false)}
//         car={car}
//         presetDates={{ startDate: bookDates?.start, endDate: bookDates?.end }}
//       />
//     </StyledCarItem>
//   );
// }

// export default CarItemComponent;

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

function CarItemComponent({ car }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [expanded, setExpanded] = useState(false);
  const [bookDates, setBookedDates] = useState({ start: null, end: null });
  const [carData, setCarData] = useState(car);
  const [ordersData, setOrders] = useState(car.orders);
  const [modalOpen, setModalOpen] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleBookingComplete = () => {
    setModalOpen(true);
  };

  const fetchCarData = async (carId) => {
    const updatedCar = await fetchCar(carId);
    const updatedOrders = await fetchOrdersByCar(carId);
    setOrders(updatedOrders);
    setCarData(updatedCar);
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
      <CalendarPicker
        car={car}
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
