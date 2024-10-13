import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Dialog,
  Grid,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Select,
  Box,
  TextField,
  CircularProgress,
} from "@mui/material";
import Snackbar from "@app/components/common/Snackbar";
import { styled } from "@mui/material/styles";
import PricingTiersTable from "./PricingTiers";
("./PricingTiers");

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: "90%",
  marginTop: 10,
}));

const EditCarModal = ({
  open,
  onClose,
  updatedCar,
  handleChange,
  handleUpdate,
  handlePricingTierChange,
  handleCheckboxChange,
  updateStatus,
  setUpdateStatus,
}) => {
  const handleCloseSnackbar = () => {
    setUpdateStatus(null);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <Grid container spacing={2} p={2}>
        <Grid item xs={12} sm={6} md={4}>
          <StyledTextField
            name="model"
            label="Model"
            value={updatedCar.model}
            onChange={handleChange}
          />
          <StyledTextField
            name="carNumber"
            label="Car Number"
            value={updatedCar.carNumber}
            onChange={handleChange}
          />
          <StyledTextField
            name="photoUrl"
            label="Photo URL"
            value={updatedCar.photoUrl}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StyledTextField
            name="seats"
            label="Seats"
            type="number"
            value={updatedCar.seats}
            onChange={handleChange}
          />
          <StyledTextField
            name="registration"
            label="Registration Year"
            type="number"
            value={updatedCar.registration}
            onChange={handleChange}
          />
          <StyledTextField
            name="regNumber"
            label="Registration Number"
            value={updatedCar.regNumber}
            onChange={handleChange}
          />
          <StyledTextField
            name="color"
            label="Color"
            value={updatedCar.color}
            onChange={handleChange}
          />
          <StyledTextField
            name="numberOfDoors"
            label="Number of Doors"
            type="number"
            value={updatedCar.numberOfDoors}
            onChange={handleChange}
          />
          <StyledTextField
            name="enginePower"
            label="Engine Power"
            type="number"
            value={updatedCar.enginePower}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          {/* Air Conditioning Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={updatedCar.airConditioning}
                onChange={handleCheckboxChange}
                name="airConditioning"
              />
            }
            label="Air Conditioning"
            sx={{ mb: 2 }}
          />

          {/* Fuel Type Selector */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Тип топлива
            </Typography>
            <Select
              fullWidth
              name="fueltype"
              label="Тип топлива"
              value={updatedCar.fueltype}
              onChange={handleChange}
            >
              {["Petrol", "Disel", "Gas"].map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Transmission Selector */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Трансмиссия
            </Typography>
            <Select
              fullWidth
              name="Transmission"
              label="Transmission"
              value={updatedCar.transmission}
              onChange={handleChange}
            >
              {["Manual", "Automatic"].map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Car Class Selector */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Класс автомобиля
            </Typography>
            <Select
              fullWidth
              name="class"
              label="class"
              value={updatedCar.class}
              onChange={handleChange}
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
          </Box>
        </Grid>

        <PricingTiersTable
          car={updatedCar}
          handlePricingTierChange={handlePricingTierChange}
        />

        {/* Display success or error message based on updateStatus */}
        {updateStatus && (
          <Snackbar
            message={updateStatus.message}
            isError={Boolean(updateStatus?.type == 400)}
            closeFunc={handleCloseSnackbar}
            open={Boolean(updateStatus)}
          />
        )}

        <Grid item xs={12}>
          <Button
            onClick={handleUpdate}
            variant="contained"
            color="primary"
            style={{ marginRight: "10px" }}
          >
            Save
          </Button>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
        </Grid>
      </Grid>
    </Dialog>
  );
};

export default EditCarModal;
