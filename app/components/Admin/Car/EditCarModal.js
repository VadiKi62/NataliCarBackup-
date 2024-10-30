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

  const renderTextField = (
    name,
    label,
    type = "text",
    defaultValue = "",
    adornment = ""
  ) => (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <TextField
        name={name}
        label={label}
        type={type}
        value={updatedCar[name] || defaultValue}
        onChange={handleChange}
        disabled={isLoading}
        size="medium"
        InputLabelProps={{
          shrink: true,
        }}
        InputProps={{
          endAdornment: adornment ? (
            <InputAdornment position="end">{adornment}</InputAdornment>
          ) : null,
        }}
      />
    </FormControl>
  );

  const renderSelectField = (name, label, options, defaultValue) => (
    <FormControl fullWidth sx={{ mb: 2 }} disabled={isLoading}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        labelId={`${name}-label`}
        name={name}
        value={updatedCar[name] || defaultValue || ""}
        onChange={handleChange}
        label={label}
        size="medium"
      >
        {options.map((option) => (
          <MenuItem key={option} value={option.toLowerCase()}>
            {capitalizeFirstLetter(option)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
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
          <DialogTitle variant="h5" gutterBottom>
            Update Car Details
          </DialogTitle>
          <Grid container spacing={3} sx={{ flexGrow: 1 }}>
            {/* Column 1 */}
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2 }}>
                {renderTextField("model", "Model")}
                {renderTextField("seats", "Seats", "number", 2)}
                {renderTextField(
                  "numberOfDoors",
                  "Number of Doors",
                  "number",
                  4
                )}
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
              </Box>
            </Grid>

            {/* Column 2 */}
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2 }}>
                {renderTextField(
                  "registration",
                  "Registration Year",
                  "number",
                  2020
                )}
                {renderTextField(
                  "enginePower",
                  "Engine Power",
                  "number",
                  1000,
                  "bhp"
                )}
                {renderTextField("engine", "engine", 122, "c.c.")}
              </Box>
            </Grid>

            {/* Column 3 */}
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2 }}>
                {renderTextField(
                  "regNumber",
                  "Registration Number",
                  "text",
                  ""
                )}
                {renderSelectField(
                  "fueltype",
                  "Fuel Type",
                  Object.values(FUEL_TYPES),
                  FUEL_TYPES.PETROL
                )}

                {renderSelectField(
                  "transmission",
                  "Transmission",
                  Object.values(TRANSMISSION_TYPES),
                  TRANSMISSION_TYPES.AUTOMATIC
                )}
                {renderSelectField(
                  "class",
                  "Car Class",
                  Object.values(CAR_CLASSES),
                  CAR_CLASSES.ECONOMY
                )}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ m: 2 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1.5 }}
                >
                  Фото
                </Typography>
                <input
                  accept="image/*"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  disabled={isLoading}
                />
                <StyledTextField
                  sx={{ mt: 2 }}
                  name="photoUrl"
                  label="Photo URL"
                  value={updatedCar.photoUrl || ""}
                  onChange={handleChange}
                  fullWidth
                  disabled={isLoading}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ m: 2 }}>
                {" "}
                <ColorPicker
                  value={updatedCar.color || ""}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </Box>
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
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Цвет
      </Typography>

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
    </Box>
  );
};

// Helper function to capitalize first letter for display
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
