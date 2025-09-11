import React, { useState, useEffect } from "react";
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
  CircularProgress,
  Collapse,
  Button,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import SpeedIcon from "@mui/icons-material/Speed";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ScrollingCalendar from "../Calendars/ScrollingCalendar";
import { fetchCar } from "@utils/action";
import { fetchOrdersByCar } from "@utils/action";
import BookingModal from "./BookingModal";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import CalendarPicker from "./CalendarPicker";
import { useMainContext } from "@app/Context";
import PricingTiers from "@app/components/CarComponent/PricingTiers";
import CarDetails from "./CarDetails";
import CarDetailsModal from "./CarDetailsModal";

import { CldImage } from "next-cloudinary";
import { useTranslation } from "react-i18next";

// ДОБАВИТЬ ЭТУ СТРОКУ:
import dayjs from "dayjs";

const StyledCarItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  marginLeft: 2,
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
    minWidth: 700,
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up("md")]: {
    // flexDirection: "row",
    // alignItems: "center",
    minWidth: 980,
    padding: theme.spacing(3),
  },
}));

const Wrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const CarImage = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: "auto",
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",

  [theme.breakpoints.up("md")]: {
    width: 450,
    height: 300,
  },
}));

// const StyledCarDetails = styled(Box)(({ theme }) => ({
//   display: "flex",
//   flexDirection: "column",
//   flexGrow: 1,
// }));

const ExpandButton = styled(IconButton)(({ theme, expanded }) => ({
  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

function CarItemComponent({ car, discount, discountStart, discountEnd }) {
  const { t } = useTranslation();
  // --- Скидка теперь приходит из родителя ---
  const [imageLoading, setImageLoading] = useState(true);
  useEffect(() => {
    // Set a 3-second delay before showing the image
    const loadingTimer = setTimeout(() => {
      setImageLoading(false);
    }, 3000);

    // Cleanup the timer when the component unmounts
    return () => clearTimeout(loadingTimer);
  }, []);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [bookDates, setBookedDates] = useState({ start: null, end: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState({
    start: null,
    end: null,
  });

  // Состояние для передачи месяца из календаря:
  const [currentCalendarDate, setCurrentCalendarDate] = useState(dayjs());

  const { fetchAndUpdateOrders, isLoading, ordersByCarId, allOrders } =
    useMainContext();
  const [carOrders, setCarOrders] = useState([]);

  // Update orders when allOrders or car._id changes
  useEffect(() => {
    const updatedOrders = ordersByCarId(car._id);
    setCarOrders(updatedOrders);
  }, [allOrders, car._id, ordersByCarId]);

  const handleBookingComplete = () => {
    setModalOpen(true);
  };

  // ДОБАВИТЬ ЭТУ ФУНКЦИЮ для передачи месяца из календаря:
  const handleCurrentDateChange = (newDate) => {
    // console.log(
    //   "CarItemComponent получил новую дату:",
    //   newDate.format("YYYY-MM-DD")
    // );
    setCurrentCalendarDate(newDate);
  };

  return (
    <StyledCarItem elevation={3}>
      <Wrapper>
        <CarImage style={{ position: 'relative', cursor: 'pointer' }}>
          {imageLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <CircularProgress />
              <CircularProgress sx={{ color: "primary.green" }} />
              <CircularProgress sx={{ color: "primary.red" }} />
            </Box>
          ) : (
            <>
              <CldImage
                onClick={() => setDetailsModalOpen(true)}
                src={car?.photoUrl || "NO_PHOTO_h2klff"}
                alt={`Natali-Cars-${car.model}`}
                width="450"
                height="300"
                crop="fill"
                priority
                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: "contain", width: "100%", height: "auto", cursor: 'pointer' }}
                onLoad={() => setImageLoading(false)}
              />
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setDetailsModalOpen(true);
                }}
                variant="outlined"
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  },
                  fontSize: '0.75rem',
                  padding: '4px 8px',
                  zIndex: 1,
                }}
              >
                {t("car.viewDetails")}
              </Button>
            </>
          )}
        </CarImage>
        <CarDetails car={car} />
      </Wrapper>
      <Stack>
        <CalendarPicker
          carId={car._id}
          isLoading={isLoading}
          orders={carOrders}
          setBookedDates={setBookedDates}
          onBookingComplete={handleBookingComplete}
          setSelectedTimes={setSelectedTimes}
          selectedTimes={selectedTimes}
          onCurrentDateChange={handleCurrentDateChange}
          discount={discount}
          discountStart={discountStart}
          discountEnd={discountEnd}
        />
        {car?.pricingTiers && (
          <PricingTiers
            prices={car?.pricingTiers}
            selectedDate={currentCalendarDate}
            discount={discount}
            discountStart={discountStart}
            discountEnd={discountEnd}
          />
        )}
      </Stack>
      <BookingModal
        fetchAndUpdateOrders={fetchAndUpdateOrders}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        car={car}
        orders={carOrders}
        presetDates={{ startDate: bookDates?.start, endDate: bookDates?.end }}
        isLoading={isLoading}
        selectedTimes={selectedTimes}
      />
      <CarDetailsModal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        car={car}
      />
    </StyledCarItem>
  );
}

export default CarItemComponent;
