"use client";
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
  TextField,
  Button,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import SpeedIcon from "@mui/icons-material/Speed";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { fetchCar } from "@utils/action";
import { fetchOrdersByCar } from "@utils/action";
import BookingModal from "@app/components/BookingModal";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import CalendarPicker from "@app/components/CalendarPicker";
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

function CarItemComponent({ car }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedCar, setUpdatedCar] = useState({ ...car });
  const [modalOpen, setModalOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    // Set a 3-second delay before showing the image
    const loadingTimer = setTimeout(() => {
      setImageLoading(false);
    }, 3000);
    return () => clearTimeout(loadingTimer);
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedCar((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    console.log("UPD DATA", updatedCar);
    try {
      const response = await fetch(`/api/car/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCar),
      });

      if (!response.ok) {
        throw new Error("Failed to update car");
      }

      const updatedCarData = await response.json();
      setUpdatedCar(updatedCarData);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      // Handle error (e.g., show a notification)
    }
  };

  return (
    <StyledCarItem elevation={3}>
      <Wrapper>
        <Link href={`/car/${car._id}`} passHref>
          <CarImage>
            {imageLoading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <CircularProgress />
              </Box>
            ) : (
              <Image src={car.photoUrl} alt={car.model} fill cover />
            )}
          </CarImage>
        </Link>

        <Box>
          {isEditing ? (
            <>
              <TextField
                name="model"
                label="Model"
                value={updatedCar.model}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                name="class"
                label="Class"
                value={updatedCar.class}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                name="color"
                label="Color"
                value={updatedCar.color}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              {/* Add more fields as necessary */}
              <Button onClick={handleUpdate}>Save</Button>
              <Button onClick={handleEditToggle}>Cancel</Button>
            </>
          ) : (
            <>
              <h5>{car.model}</h5>
              <p>Class: {car.class}</p>
              <p>Color: {car.color}</p>
              <Button onClick={handleEditToggle}>Edit</Button>
            </>
          )}
        </Box>
      </Wrapper>
      <CalendarPicker
        isLoading={false} // Adjust as needed
        orders={[]} // Pass relevant data
        setBookedDates={() => {}}
        onBookingComplete={() => {}}
      />
      <BookingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        car={car}
        orders={[]} // Pass relevant data
        isLoading={false} // Adjust as needed
      />
    </StyledCarItem>
  );
}

export default CarItemComponent;
