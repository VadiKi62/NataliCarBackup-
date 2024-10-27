import React, { useState, useRef } from "react";
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
import { useMainContext } from "@app/Context";

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
  handleCheckboxChange,
  setUpdatedCar,
}) => {
  const { updateCarInContext, setUpdateStatus } = useMainContext();

  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleCloseModal = () => onClose();

  const handleImageUpload = async () => {
    const file = fileInputRef.current.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setIsLoading(true);
      const response = await fetch("/api/order/update/image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      const message = data.success ? data.data : data.message;

      if (data.success) {
        const response = await updateCarInContext({
          ...updatedCar,
          photoUrl: message,
        });
        setUpdateStatus({ type: response.type, message: response.message });
      } else {
        console.error("Image upload failed:", message);
        setUpdateStatus({ type: 400, message });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setUpdateStatus({ type: 400, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const renderTextField = (name, label, type = "text", defaultValue) => (
    <StyledTextField
      name={name}
      label={label}
      type={type}
      value={updatedCar[name] || defaultValue}
      onChange={handleChange}
      fullWidth
      disabled={isLoading}
    />
  );

  const renderSelectField = (name, label, options, defaultValue) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Select
        fullWidth
        name={name}
        value={updatedCar[name] || defaultValue}
        onChange={handleChange}
        disabled={isLoading}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );

  const handleSave = async () => {
    setIsLoading(true);
    await handleUpdate();
    setIsLoading(false);
  };
  return (
    <Dialog open={open} onClose={handleCloseModal} fullWidth maxWidth="lg">
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

        <Box sx={{ opacity: isLoading ? 0.3 : 1, transition: "opacity 0.2s" }}>
          <Typography variant="h5" gutterBottom>
            Update Car Details
          </Typography>
          <Grid container spacing={3}>
            {/* Column 1 */}
            <Grid item xs={12} sm={6} md={4}>
              {renderTextField("model", "Model")}
              {renderTextField("seats", "Seats", "number", 2)}
              {renderTextField("numberOfDoors", "Number of Doors", "number", 4)}
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
              {renderTextField(
                "registration",
                "Registration Year",
                "number",
                12320
              )}
              {renderTextField("color", "Color", "text", "white")}
              {renderTextField("enginePower", "Engine Power", "number", 1000)}
            </Grid>

            {/* Column 3 */}
            <Grid item xs={12} sm={6} md={4}>
              {renderTextField(
                "regNumber",
                "Registration Number",
                "text",
                "aqwert"
              )}
              {renderSelectField(
                "fueltype",
                "Fuel Type",
                [
                  "Petrol",
                  "Diesel",
                  "Natural Gas",
                  "Natural Gas(sng)",
                  "Hybrid Petrol",
                  "Hybrid Diesel",
                ],
                "Petrol"
              )}
              {renderSelectField(
                "transmission",
                "Transmission",
                ["Manual", "Automatic"],
                "Automatic"
              )}
              {renderSelectField(
                "class",
                "Car Class",
                [
                  "Economy",
                  "Premium",
                  "MiniBus",
                  "Crossover",
                  "Limousine",
                  "Compact",
                  "Convertible",
                ],
                "Economy"
              )}
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Upload Photo
                </Typography>
                <input
                  accept="image/*"
                  type="file"
                  ref={fileInputRef}
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
                disabled={isLoading}
                handleChange={handleChange}
                setUpdatedCar={setUpdatedCar}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ textAlign: "center", mt: 1 }}>
                <Button
                  onClick={onClose}
                  variant="outlined"
                  disabled={isLoading}
                  sx={{ p: 3, minWidth: "10rem" }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  variant="contained"
                  color="primary"
                  sx={{ ml: 2, p: 3, minWidth: "10rem" }}
                  disabled={isLoading}
                >
                  Save
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
