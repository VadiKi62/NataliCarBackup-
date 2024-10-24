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
import { FaBullseye } from "react-icons/fa";

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
  isLoading,
  setIsLoading,
}) => {
  const handleCloseSnackbar = () => {
    setUpdateStatus(null);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    try {
      setIsLoading(true);
      const response = await fetch("/api/order/update/image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log("data from POST IMAGE", data);

      if (data.success) {
        setUpdatedCar((prevCar) => ({
          ...prevCar,
          photoUrl: data.data,
        }));
        setUpdateStatus({ type: 200, message: data.message });
      } else {
        console.error("Image upload failed:", data.message);
        setUpdateStatus({ type: 400, message: data.message });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setUpdateStatus({ type: 400, message: error ? error : error?.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <Box sx={{ p: 3, position: "relative" }}>
        {/* Loading Overlay */}
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* Content with reduced opacity when loading */}
        <Box sx={{ opacity: isLoading ? 0.3 : 1, transition: "opacity 0.2s" }}>
          <Typography variant="h5" gutterBottom>
            Update Car Details
          </Typography>
          <Grid container spacing={3}>
            {/* Column 1 */}
            <Grid item xs={12} sm={6} md={4}>
              <StyledTextField
                name="model"
                label="Model"
                value={updatedCar.model || ""}
                onChange={handleChange}
                fullWidth
                disabled={isLoading}
              />
              <StyledTextField
                name="seats"
                label="Seats"
                type="number"
                value={updatedCar.seats || 0}
                onChange={handleChange}
                fullWidth
                disabled={isLoading}
              />
              <StyledTextField
                name="numberOfDoors"
                label="Number of Doors"
                type="number"
                value={updatedCar.numberOfDoors || 0}
                onChange={handleChange}
                fullWidth
                disabled={isLoading}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={updatedCar.airConditioning || false}
                    onChange={handleCheckboxChange}
                    name="airConditioning"
                    disabled={isLoading}
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
                value={updatedCar.registration || 0}
                onChange={handleChange}
                fullWidth
                disabled={isLoading}
              />
              <StyledTextField
                name="color"
                label="Color"
                value={updatedCar.color || ""}
                onChange={handleChange}
                fullWidth
                disabled={isLoading}
              />
              <StyledTextField
                name="enginePower"
                label="Engine Power"
                type="number"
                value={updatedCar.enginePower || 0}
                onChange={handleChange}
                fullWidth
                disabled={isLoading}
              />
            </Grid>

            {/* Column 3 */}
            <Grid item xs={12} sm={6} md={4}>
              <StyledTextField
                name="regNumber"
                label="Registration Number"
                value={updatedCar.regNumber || ""}
                onChange={handleChange}
                fullWidth
                disabled={isLoading}
              />

              {/* Fuel Type Selector */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Fuel Type
                </Typography>
                <Select
                  fullWidth
                  name="fueltype"
                  value={updatedCar.fueltype || ""}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  {[
                    "Petrol",
                    "Diesel",
                    "Gas",
                    "Hybrid Petrol",
                    "Hybrid Gas",
                  ].map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
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
                  value={updatedCar.transmission || ""}
                  onChange={handleChange}
                  disabled={isLoading}
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
                  value={updatedCar.class || ""}
                  onChange={handleChange}
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </Box>
              <StyledTextField
                name="photoUrl"
                label="Photo URL"
                value={updatedCar.photoUrl || ""}
                onChange={handleChange}
                fullWidth
                disabled={isLoading}
              />
            </Grid>

            {/* Pricing Table */}
            <Grid item xs={12}>
              <PricingTiersTable
                car={updatedCar}
                handlePricingTierChange={handlePricingTierChange}
                disabled={isLoading}
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
                  disabled={isLoading}
                >
                  Save
                </Button>
                <Button
                  onClick={onClose}
                  variant="outlined"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Dialog>
  );
};

export default EditCarModal;
