import React, { useState, useRef } from "react";
import {
  Dialog,
  Grid,
  DialogActions,
  MenuItem,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  FormControl,
  DialogTitle,
  InputLabel,
  Select,
  Box,
  TextField,
  RadioGroup,
  Radio,
  CircularProgress,
  InputAdornment,
  Stack,
} from "@mui/material";
import Snackbar from "@app/components/common/Snackbar";
import { styled } from "@mui/material/styles";
import PricingTiersTable from "./PricingTiers";
import { useMainContext } from "@app/Context";
import {
  CAR_CLASSES,
  TRANSMISSION_TYPES,
  FUEL_TYPES,
  PREDEFINED_COLORS,
} from "@models/enums";
import {
  RenderTextField,
  RenderSelectField,
} from "@app/components/common/Fields";
import CarImageUpload from "../AddImageComponent";

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
  const [imagePreview, setImagePreview] = useState(updatedCar.photoUrl || "");
  const handleCloseModal = () => onClose();

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Показываем превью загружаемого изображения
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result); // Обновляем превью
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsLoading(true);
      // Загружаем изображение на Cloudinary
      const response = await fetch("/api/order/update/image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("data is:", data);

      if (data.success) {
        // если URL был успешно получен
        const updatedPhotoUrl = data.secure_url; // получаем URL изображения

        // Обновляем машину с новым photoUrl
        const response = await updateCarInContext({
          ...updatedCar,
          photoUrl: updatedPhotoUrl,
        });
        setUpdateStatus({
          type: response.type || "200",
          message: response.message,
        });
      } else {
        console.error("Image upload failed:", data.message);
        setUpdateStatus({ type: 400, message: data.message });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setUpdateStatus({ type: 400, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

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
          <DialogTitle>Update Car Details</DialogTitle>
          <Grid container spacing={3} sx={{ flexGrow: 1 }}>
            {/* Column 1 */}
            <Grid item xs={12} sm={3}>
              <Stack spacing={3}>
                <RenderTextField
                  name="model"
                  label="Model"
                  defaultValue="Toyota"
                  updatedCar={updatedCar}
                  handleChange={handleChange}
                  isLoading={isLoading}
                />
                <RenderSelectField
                  name="class"
                  label="Class"
                  options={Object.values(CAR_CLASSES)}
                  required
                  updatedCar={updatedCar}
                  handleChange={handleChange}
                  isLoading={isLoading}
                />
                <RenderSelectField
                  name="transmission"
                  label="Transmission"
                  options={Object.values(TRANSMISSION_TYPES)}
                  required
                  updatedCar={updatedCar}
                  handleChange={handleChange}
                  isLoading={isLoading}
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
              </Stack>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Stack spacing={3}>
                <RenderSelectField
                  name="fueltype"
                  label="Fuel Type"
                  options={Object.values(FUEL_TYPES)}
                  required
                  updatedCar={updatedCar}
                  handleChange={handleChange}
                  isLoading={isLoading}
                />
                <RenderTextField
                  name="registration"
                  label="Registration Year"
                  defaultValue={updatedCar.registration}
                  type="number"
                  updatedCar={updatedCar}
                  handleChange={handleChange}
                  isLoading={isLoading}
                />
                <RenderTextField
                  name="regNumber"
                  label="Registration Number"
                  defaultValue={updatedCar.regNumber}
                  updatedCar={updatedCar}
                  handleChange={handleChange}
                  isLoading={isLoading}
                />
              </Stack>
            </Grid>

            {/* Column 3 */}
            <Grid item xs={12} sm={3}>
              <Stack spacing={3}>
                <RenderTextField
                  type="number"
                  name="numberOfDoors"
                  label="Number of Doors"
                  defaultValue={updatedCar.numberOfDoors}
                  updatedCar={updatedCar}
                  handleChange={handleChange}
                  isLoading={isLoading}
                />

                <RenderTextField
                  type="number"
                  name="seats"
                  label="Seats"
                  defaultValue={updatedCar.seats}
                  updatedCar={updatedCar}
                  handleChange={handleChange}
                  isLoading={isLoading}
                />
                <RenderTextField
                  type="number"
                  name="enginePower"
                  label="Engine Power"
                  defaultValue={updatedCar.enginePower}
                  updatedCar={updatedCar}
                  handleChange={handleChange}
                  isLoading={isLoading}
                  adornment="bhp"
                />
              </Stack>
            </Grid>

            <Grid item xs={12} sm={3}>
              <RenderTextField
                type="number"
                name="engine"
                label="Engine"
                defaultValue={updatedCar.enginePower}
                updatedCar={updatedCar}
                handleChange={handleChange}
                isLoading={isLoading}
                adornment="c.c."
              />
              <CarImageUpload
                photoUrl={updatedCar.photoUrl || ""}
                handleChange={handleChange}
                handleImageChange={handleImageUpload}
                imagePreview={imagePreview}
              />

              {/* <TextField
                name="photoUrl"
                label="Photo URL"
                value={updatedCar.photoUrl || ""}
                onChange={handleChange}
                fullWidth
                disabled={isLoading}
              />
              <input
                accept="image/*"
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                disabled={isLoading}
              /> */}

              <ColorPicker
                value={updatedCar.color || ""}
                onChange={handleChange}
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12}>
              <PricingTiersTable
                car={updatedCar}
                disabled={isLoading}
                handleChange={handleChange}
                setUpdatedCar={setUpdatedCar}
              />
            </Grid>

            <Grid item xs={12}>
              <DialogActions
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  mt: 3,
                  pt: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Button
                  onClick={onClose}
                  variant="outlined"
                  disabled={isLoading}
                  sx={{ py: 1.5, px: 4, minWidth: "140px" }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  variant="contained"
                  color="primary"
                  disabled={isLoading}
                  sx={{ py: 1.5, px: 4, minWidth: "140px" }}
                >
                  Save
                </Button>
              </DialogActions>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Dialog>
  );
};

export default EditCarModal;

const ColorPicker = ({ value, onChange, disabled = false }) => {
  const [colorMode, setColorMode] = useState(
    Object.values(PREDEFINED_COLORS).includes(value?.toLowerCase())
      ? "predefined"
      : "custom"
  );

  const handleColorModeChange = (event) => {
    setColorMode(event.target.value);
    // Reset to first predefined color if switching to predefined mode
    if (event.target.value === "predefined") {
      onChange({ target: { name: "color", value: PREDEFINED_COLORS.BLACK } });
    }
  };

  const handleColorChange = (event) => {
    onChange({
      target: { name: "color", value: event.target.value.toLowerCase() },
    });
  };

  return (
    <Box sx={{ mt: 2 }}>
      {colorMode === "predefined" ? (
        <FormControl fullWidth disabled={disabled}>
          <Select
            value={value || ""}
            onChange={handleColorChange}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "4px",
                    backgroundColor: selected,
                    border: "1px solid rgba(0, 0, 0, 0.12)",
                  }}
                />
                {selected.charAt(0).toUpperCase() + selected.slice(1)}
              </Box>
            )}
          >
            {Object.entries(PREDEFINED_COLORS).map(([key, color]) => (
              <MenuItem key={key} value={color}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "4px",
                      backgroundColor: color,
                      border: "1px solid rgba(0, 0, 0, 0.12)",
                    }}
                  />
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <TextField
          fullWidth
          name="color"
          placeholder="Введите свой цвет"
          value={value || ""}
          onChange={handleColorChange}
          disabled={disabled}
          helperText="Введите цвет"
        />
      )}
      <RadioGroup
        row
        value={colorMode}
        onChange={handleColorModeChange}
        sx={{ mb: 1 }}
      >
        <FormControlLabel
          value="predefined"
          control={<Radio size="small" />}
          label="Выбрать из списка"
          disabled={disabled}
        />
        <FormControlLabel
          value="custom"
          control={<Radio size="small" />}
          label="Свой цвет"
          disabled={disabled}
        />
      </RadioGroup>
    </Box>
  );
};

// Helper function to capitalize first letter for display
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
