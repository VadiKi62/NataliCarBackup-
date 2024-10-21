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
              value={updatedCar.model || ""} // Fallback to an empty string
              onChange={handleChange}
              fullWidth
            />
            <StyledTextField
              name="seats"
              label="Seats"
              type="number"
              value={updatedCar.seats || 0} // Fallback to 0 for number input
              onChange={handleChange}
              fullWidth
            />
            <StyledTextField
              name="numberOfDoors"
              label="Number of Doors"
              type="number"
              value={updatedCar.numberOfDoors || 0} // Fallback to 0 for number input
              onChange={handleChange}
              fullWidth
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={updatedCar.airConditioning || false} // Fallback to false for checkbox
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
              value={updatedCar.registration || 0} // Fallback to 0
              onChange={handleChange}
              fullWidth
            />
            <StyledTextField
              name="color"
              label="Color"
              value={updatedCar.color || ""} // Fallback to an empty string
              onChange={handleChange}
              fullWidth
            />
            <StyledTextField
              name="enginePower"
              label="Engine Power"
              type="number"
              value={updatedCar.enginePower || 0} // Fallback to 0
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          {/* Column 3 */}
          <Grid item xs={12} sm={6} md={4}>
            <StyledTextField
              name="regNumber"
              label="Registration Number"
              value={updatedCar.regNumber || ""} // Fallback to an empty string
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
                value={updatedCar.fueltype || ""} // Fallback to an empty string
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
                value={updatedCar.transmission || ""} // Fallback to an empty string
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
                value={updatedCar.class || ""} // Fallback to an empty string
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
              value={updatedCar.photoUrl || ""} // Fallback to an empty string
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
