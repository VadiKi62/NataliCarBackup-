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
  Button,
  CircularProgress,
  Collapse,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import SpeedIcon from "@mui/icons-material/Speed";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import EditCarModal from "./EditCarModal";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import CalendarAdmin from "./CalendarAdmin";
import { updateCar } from "@utils/action";
import { useMainContext } from "@app/Context";
import DefaultButton from "../common/DefaultButton";
import { deleteCar } from "@utils/action";
import Snackbar from "@app/components/common/Snackbar";

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
    minWidth: 950,
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

  [theme.breakpoints.up("md")]: {
    width: 450,
    height: 300,
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
  marginTop: theme.spacing(1),
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

function CarItemComponent({
  car,
  onCarUpdate,
  onCarDelete,
  orders,
  handleOrderUpdate,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatedCar, setUpdatedCar] = useState({ ...car });
  const [imageLoading, setImageLoading] = useState(true);

  const { ordersByCarId, allOrders, fetchAndUpdateOrders } = useMainContext();

  const [carOrders, setCarOrders] = useState([]);
  const [updateStatus, setUpdateStatus] = useState(null);

  // Update orders when allOrders or car._id changes
  useEffect(() => {
    const updatedOrders = ordersByCarId(car._id);
    setCarOrders(updatedOrders);
  }, [allOrders, car._id, ordersByCarId]);

  useEffect(() => {
    // Set a 3-second delay before showing the image
    const loadingTimer = setTimeout(() => {
      setImageLoading(false);
    }, 3000);

    // Cleanup the timer when the component unmounts
    return () => clearTimeout(loadingTimer);
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setIsExpanded(true);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("e.target", e.target);
    setUpdatedCar((prev) => ({ ...prev, [name]: value }));
  };
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setUpdatedCar((prev) => ({ ...prev, [name]: checked }));
  };

  const handlePricingTierChange = (season, day, newPrice) => {
    // Find the season and update the price for the specific day
    const updatedCar = { ...car }; // Assuming `car` is a state object
    updatedCar.pricingTiers[season].days[day] = parseFloat(newPrice); // Update the price
    setUpdatedCar(updatedCar); // Set the updated car state
  };

  const handleCarsUpdate = async () => {
    try {
      console.log(updatedCar);
      const updatedCarData = await updateCar(updatedCar);
      setUpdatedCar(updatedCarData);
      setIsEditing(false);

      // Set success status and message
      setUpdateStatus({
        type: 200,
        message: "Car updated successfully!",
      });

      onCarUpdate(updatedCarData);
    } catch (error) {
      console.error("Failed to update car:", error);

      // Set error status and message
      setUpdateStatus({
        type: 400,
        message: "Failed to update car. Please try again.",
      });
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setUpdateStatus(null);
  };

  const handleDelete = async () => {
    if (window.confirm(`Вы уверены что хотите удалить ${car.model}?`)) {
      try {
        const response = await deleteCar(car._id);
        console.log(response);

        if (response.type === 200) {
          onCarDelete(response);
        }
      } catch (error) {
        console.error("Error:", error);
        // Set error status and message
        onCarDelete(error);
      }
    }
  };

  return (
    <StyledCarItem elevation={3}>
      <Wrapper>
        <CarImage>
          {imageLoading && car?.photoUrl ? (
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
            <Image
              src={car.photoUrl}
              alt={car.model}
              fill
              priority
              onLoad={() => setImageLoading(false)}
            />
          )}
        </CarImage>
        <CarDetails>
          <CarTitle variant="h5">{car.model}</CarTitle>
          <Box mb={2}>
            <CarInfo>
              <DirectionsCarIcon /> Class: {car.class}
            </CarInfo>
            <CarInfo>
              <TimeToLeaveIcon /> Transmission: {car.transmission}
            </CarInfo>
            <CarInfo>
              <TimeToLeaveIcon /> Doors: {car?.numberOfDoors}
            </CarInfo>
            <CarInfo>
              <AcUnitIcon /> AC: {car?.airConditioning ? "Yes" : "No"}
            </CarInfo>
            <CarInfo>
              <SpeedIcon /> Engine Power: {car?.enginePower}
            </CarInfo>
          </Box>
        </CarDetails>
        <DefaultButton
          relative
          minWidth="100%"
          onClick={handleDelete}
          sx={{ backgroundColor: "primary.main", color: "white" }}
        >
          Удалить эту машину
        </DefaultButton>
        <DefaultButton relative minWidth="100%" onClick={handleEditToggle}>
          Редактировать
        </DefaultButton>
      </Wrapper>

      <CalendarAdmin
        orders={carOrders}
        handleOrderUpdate={handleOrderUpdate}
        setCarOrders={setCarOrders}
      />
      <EditCarModal
        open={modalOpen}
        onClose={handleModalClose}
        updatedCar={updatedCar}
        handleChange={handleChange}
        handleUpdate={handleCarsUpdate}
        handlePricingTierChange={handlePricingTierChange}
        handleCheckboxChange={handleCheckboxChange}
        updateStatus={updateStatus}
        setUpdateStatus={setUpdateStatus}
        handleOrderUpdate={handleOrderUpdate}
        setUpdatedCar={setUpdatedCar}
      />
    </StyledCarItem>
  );
}

export default CarItemComponent;
