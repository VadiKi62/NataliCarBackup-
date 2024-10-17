import React from "react";
import {
  Dialog,
  Grid,
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
  setUpdatedCar,
}) => {
  const handleCloseSnackbar = () => {
    setUpdateStatus(null);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/order/update/image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log("data from POST IMAGE", data);

      if (data.success) {
        setUpdatedCar((prevCar) => ({
          ...prevCar,
          photoUrl: `/images/${data.data}`,
        }));
        console.log(data.message);
      } else {
        console.error("Image upload failed:", data.message);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Update Car Details
        </Typography>
        <Grid container spacing={3}>
          {/* Column 1 */}
          <Grid item xs={12} sm={6} md={4}>
            <StyledTextField
              name="model"
              label="Model"
              value={updatedCar.model}
              onChange={handleChange}
              fullWidth
            />
            <StyledTextField
              name="seats"
              label="Seats"
              type="number"
              value={updatedCar.seats}
              onChange={handleChange}
              fullWidth
            />
            <StyledTextField
              name="numberOfDoors"
              label="Number of Doors"
              type="number"
              value={updatedCar.numberOfDoors}
              onChange={handleChange}
              fullWidth
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={updatedCar.airConditioning}
                  onChange={handleCheckboxChange}
                  name="airConditioning"
                />
              }
              label="Air Conditioning"
              sx={{ my: 2 }}
            />
          </Grid>

          {/* Column 2 */}
          <Grid item xs={12} sm={6} md={4}>
            <StyledTextField
              name="registration"
              label="Registration Year"
              type="number"
              value={updatedCar.registration}
              onChange={handleChange}
              fullWidth
            />
            <StyledTextField
              name="color"
              label="Color"
              value={updatedCar.color}
              onChange={handleChange}
              fullWidth
            />
            <StyledTextField
              name="enginePower"
              label="Engine Power"
              type="number"
              value={updatedCar.enginePower}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          {/* Column 3 */}
          <Grid item xs={12} sm={6} md={4}>
            <StyledTextField
              name="regNumber"
              label="Registration Number"
              value={updatedCar.regNumber}
              onChange={handleChange}
              fullWidth
            />

            {/* Fuel Type Selector */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Fuel Type
              </Typography>
              <Select
                fullWidth
                name="fueltype"
                value={updatedCar.fueltype}
                onChange={handleChange}
              >
                {["Petrol", "Diesel", "Gas", "Hybrid Petrol", "Hybrid Gas"].map(
                  (type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  )
                )}
              </Select>
            </Box>

            {/* Transmission Selector */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Transmission
              </Typography>
              <Select
                fullWidth
                name="transmission"
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
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Car Class
              </Typography>
              <Select
                fullWidth
                name="class"
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

          {/* Air Conditioning & Photo URL */}
          <Grid item xs={12} sm={6} md={4}></Grid>

          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Upload Photo
              </Typography>
              <input
                accept="image/*"
                type="file"
                onChange={handleImageUpload}
              />
            </Box>
            <StyledTextField
              name="photoUrl"
              label="Photo URL"
              value={updatedCar.photoUrl}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          {/* Pricing Table */}
          <Grid item xs={12}>
            <PricingTiersTable
              car={updatedCar}
              handlePricingTierChange={handlePricingTierChange}
            />
          </Grid>

          {/* Display success or error message */}
          {updateStatus && (
            <Snackbar
              message={updateStatus.message}
              isError={Boolean(updateStatus?.type === 400)}
              closeFunc={handleCloseSnackbar}
              open={Boolean(updateStatus)}
            />
          )}

          <Grid item xs={12}>
            <Box sx={{ textAlign: "right", mt: 3 }}>
              <Button
                onClick={handleUpdate}
                variant="contained"
                color="primary"
                sx={{ mr: 2 }}
              >
                Save
              </Button>
              <Button onClick={onClose} variant="outlined">
                Cancel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Dialog>
  );
};

export default EditCarModal;
