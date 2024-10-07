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

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: "90%",
  marginTop: 10,
}));

const EditCarModal = ({
  open,
  onClose,
  car,
  updatedCar,
  handleChange,
  handleUpdate,
  orders,
  handlePricingTierChange,
  handleCheckboxChange,
  updateStatus,
  setUpdateStatus,
}) => {
  const handleCloseSnackbar = () => {
    setUpdateStatus(null);
  };

  const tierStrings = {
    3: "3-4 days",
    6: "5-14 days",
    10: "15 days+",
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
          <Select
            sx={{ mt: 1 }}
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
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Select
            sx={{ mt: 1 }}
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
          <StyledTextField
            name="fueltype"
            label="Fuel Type"
            value={updatedCar.fueltype}
            onChange={handleChange}
          />
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
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
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
            {Object.entries(updatedCar.pricingTiers).map(([tier, price]) => (
              <Grid item xs={6} sm={4} md={3} key={tier}>
                <StyledTextField
                  name={`pricingTiers.${tier}`}
                  label={tierStrings[`${tier}`]}
                  type="number"
                  value={price}
                  onChange={(e) =>
                    handlePricingTierChange(tier, e.target.value)
                  }
                  fullWidth
                  margin="normal"
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

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
