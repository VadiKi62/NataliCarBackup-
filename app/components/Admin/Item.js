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

import EditModal from "./EditModal";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import CalendarAdmin from "./CalendarAdmin";
import { updateCar } from "@utils/action";
import { useMainContext } from "@app/Context";
import DefaultButton from "../common/DefaultButton";

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

function CarItemComponent({ car, onCarUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatedCar, setUpdatedCar] = useState({ ...car });
  const [imageLoading, setImageLoading] = useState(true);

  const { ordersByCarId, allOrders } = useMainContext();
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

  const handleExpandToggle = () => {
    setIsExpanded(!isExpanded);
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setIsExpanded(true);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedCar((prev) => ({ ...prev, [name]: value }));
  };
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setUpdatedCar((prev) => ({ ...prev, [name]: checked }));
  };

  const handlePricingTierChange = (tier, value) => {
    setUpdatedCar((prev) => ({
      ...prev,
      pricingTiers: { ...prev.pricingTiers, [tier]: Number(value) },
    }));
  };

  const handleUpdate = async () => {
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

      if (onCarUpdate) {
        onCarUpdate(updatedCarData);
      }
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

  return (
    <StyledCarItem elevation={3}>
      <Wrapper>
        <CarImage>
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
            <Image
              src={car.photoUrl}
              alt={car.model}
              fill
              cover
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
          {/* <Box mb={2}>
            {Object.entries(car?.pricingTiers).map(([days, price]) => (
              <PriceChip
                key={days}
                label={`${days}d+ €${price}`}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box> */}
          {/* <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          > */}
          {/* <Button onClick={handleExpandToggle}>
              {isExpanded ? "Hide Details" : "Show Full Info"}
            </Button> */}
          {/* <DefaultButton relative minWidth="500px" onClick={handleEditToggle}>
            Edit
          </DefaultButton> */}
          {/* </Box> */}
        </CarDetails>
        <DefaultButton relative minWidth="100%" onClick={handleEditToggle}>
          Edit
        </DefaultButton>
      </Wrapper>

      <CalendarAdmin orders={carOrders} />
      <EditModal
        open={modalOpen}
        onClose={handleModalClose}
        car={car}
        updatedCar={updatedCar}
        handleChange={handleChange}
        handleUpdate={handleUpdate}
        orders={carOrders}
        handlePricingTierChange={handlePricingTierChange}
        handleCheckboxChange={handleCheckboxChange}
        updateStatus={updateStatus}
        setUpdateStatus={setUpdateStatus}
      />
    </StyledCarItem>
  );
}

export default CarItemComponent;
