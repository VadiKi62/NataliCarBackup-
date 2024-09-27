import React, { useState, useEffect } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";

import { styled } from "@mui/material/styles";

import Image from "next/image";
import Link from "next/link";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import SpeedIcon from "@mui/icons-material/Speed";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { fetchCar } from "@utils/action";
import { fetchOrdersByCar } from "@utils/action";

import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import CalendarAdmin from "./CalendarAdmin";

import {
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Collapse,
} from "@mui/material";

const StyledCarItem = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const CompactView = styled(CardContent)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

const ExpandedView = styled(CardContent)(({ theme }) => ({
  paddingTop: 0,
}));

const CarImage = styled(CardMedia)(({ theme }) => ({
  width: 180,
  height: 100,
  backgroundSize: "cover",
  marginRight: theme.spacing(2),
}));

function CarItemComponent({ car, onCarUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedCar, setUpdatedCar] = useState({ ...car });

  const handleExpandToggle = () => {
    setIsExpanded(!isExpanded);
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setIsExpanded(true);
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
      const updatedCarData = await updateCar(updatedCar);
      setUpdatedCar(updatedCarData);
      setIsEditing(false);
      if (onCarUpdate) {
        onCarUpdate(updatedCarData);
      }
    } catch (error) {
      console.error("Failed to update car:", error);
    }
  };

  return (
    <StyledCarItem>
      <CompactView>
        <Box display="flex" alignItems="center">
          <CarImage image={car.photoUrl} title={car.model} />
          <Box>
            <Typography variant="h6">{car.model}</Typography>
            <Typography variant="body2" color="textSecondary">
              Car Number: {car.carNumber}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Button onClick={handleExpandToggle}>
            {isExpanded ? "Hide Details" : "Show Full Info"}
          </Button>
          <Button onClick={handleEditToggle}>Edit</Button>
        </Box>
      </CompactView>

      <Collapse in={isExpanded}>
        <ExpandedView>
          {isEditing ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="model"
                  label="Model"
                  value={updatedCar.model}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  name="carNumber"
                  label="Car Number"
                  value={updatedCar.carNumber}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  name="photoUrl"
                  label="Photo URL"
                  value={updatedCar.photoUrl}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <Select
                  name="class"
                  value={updatedCar.class}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                >
                  {[
                    "Economy",
                    "Premium",
                    "MiniBus",
                    "Crossover",
                    "Limousine",
                    "Compact",
                    "Convertible",
                  ].map((cls) => (
                    <MenuItem key={cls} value={cls}>
                      {cls}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="transmission"
                  label="Transmission"
                  value={updatedCar.transmission}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  name="fueltype"
                  label="Fuel Type"
                  value={updatedCar.fueltype}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  name="seats"
                  label="Seats"
                  type="number"
                  value={updatedCar.seats}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  name="registration"
                  label="Registration Year"
                  type="number"
                  value={updatedCar.registration}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="regNumber"
                  label="Registration Number"
                  value={updatedCar.regNumber}
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
                <TextField
                  name="numberOfDoors"
                  label="Number of Doors"
                  type="number"
                  value={updatedCar.numberOfDoors}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  name="enginePower"
                  label="Engine Power"
                  type="number"
                  value={updatedCar.enginePower}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={updatedCar.airConditioning}
                      onChange={handleCheckboxChange}
                      name="airConditioning"
                    />
                  }
                  label="Air Conditioning"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">Pricing Tiers:</Typography>
                <Grid container spacing={2}>
                  {Object.entries(updatedCar.pricingTiers).map(
                    ([tier, price]) => (
                      <Grid item xs={6} sm={4} md={3} key={tier}>
                        <TextField
                          name={`pricingTiers.${tier}`}
                          label={`Tier ${tier}`}
                          type="number"
                          value={price}
                          onChange={(e) =>
                            handlePricingTierChange(tier, e.target.value)
                          }
                          fullWidth
                          margin="normal"
                        />
                      </Grid>
                    )
                  )}
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Button
                  onClick={handleUpdate}
                  variant="contained"
                  color="primary"
                  style={{ marginRight: "10px" }}
                >
                  Save
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outlined">
                  Cancel
                </Button>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography>
                  <strong>Class:</strong> {car.class}
                </Typography>
                <Typography>
                  <strong>Color:</strong> {car.color}
                </Typography>
                <Typography>
                  <strong>Transmission:</strong> {car.transmission}
                </Typography>
                <Typography>
                  <strong>Fuel Type:</strong> {car.fueltype}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography>
                  <strong>Seats:</strong> {car.seats}
                </Typography>
                <Typography>
                  <strong>Registration Year:</strong> {car.registration}
                </Typography>
                <Typography>
                  <strong>Registration Number:</strong> {car.regNumber}
                </Typography>
                <Typography>
                  <strong>Number of Doors:</strong> {car.numberOfDoors}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography>
                  <strong>Air Conditioning:</strong>{" "}
                  {car.airConditioning ? "Yes" : "No"}
                </Typography>
                <Typography>
                  <strong>Engine Power:</strong> {car.enginePower}
                </Typography>
                <Typography>
                  <strong>Engine:</strong> {car.engine}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="h6">Pricing Tiers:</Typography>
                {Object.entries(car.pricingTiers).map(([tier, price]) => (
                  <Typography key={tier}>
                    <strong>Tier {tier}:</strong> {price}
                  </Typography>
                ))}
              </Grid>
            </Grid>
          )}
        </ExpandedView>
      </Collapse>

      <CardContent>
        <CalendarAdmin
          isLoading={false}
          orders={[]}
          setBookedDates={() => {}}
          onBookingComplete={() => {}}
        />
      </CardContent>
    </StyledCarItem>
  );
}

export default CarItemComponent;
