import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import PricingTiers from "./Car/PricingTiers";
import { useMainContext } from "@app/Context";
import {
  CAR_CLASSES,
  TRANSMISSION_TYPES,
  FUEL_TYPES,
  PREDEFINED_COLORS,
  defaultPrices,
} from "@models/enums";

const AddCarModal = ({
  open,
  onClose,
  car,
  setUpdateStatus,
  fetchAndUpdateCars,
}) => {
  const { resubmitCars } = useMainContext();
  const [loading, setLoading] = useState(false);
  const [carData, setCarData] = useState({
    carNumber: "",
    model: "",
    sort: 999,
    class: "",
    class: CAR_CLASSES.ECONOMY,
    transmission: TRANSMISSION_TYPES.AUTOMATIC,
    fueltype: FUEL_TYPES.PETROL,
    seats: 5,
    registration: 2016,
    regNumber: "",
    color: "",
    numberOfDoors: 4,
    airConditioning: true,
    enginePower: "",
    engine: "1.500",
    pricingTiers: defaultPrices,
  });

  const [selectedImage, setSelectedImage] = useState(null);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    console.log(e.target);

    if (carData[name] !== newValue) {
      setCarData((prevData) => ({ ...prevData, [name]: newValue }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log(carData.pricingTiers);

    try {
      const formData = new FormData();
      formData.append("model", carData.model);
      formData.append("class", carData.class);
      formData.append("transmission", carData.transmission);
      formData.append("fueltype", carData.fueltype || "");
      formData.append("seats", String(carData.seats));
      formData.append("numberOfDoors", String(carData.numberOfDoors));
      formData.append("airConditioning", Boolean(carData.airConditioning));
      formData.append("enginePower", String(carData.enginePower));
      formData.append("color", String(carData.color));
      formData.append("pricingTiers", JSON.stringify(carData.pricingTiers));

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await fetch("/api/car/addOne", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setUpdateStatus({ message: result.message, type: result.status });

      if (result.status === 200) {
        await resubmitCars(); // Refresh car data
        onClose(); // Close the modal
        setCarData({});
        setSelectedImage(null); // Clear image
      }
    } catch (error) {
      setUpdateStatus({ message: error.message, type: 400 });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file !== selectedImage) {
      setSelectedImage(file);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        {loading && (
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
        <DialogTitle>Add New Car</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Model"
                  name="model"
                  value={carData.model}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required>
                  <InputLabel>Class</InputLabel>
                  <Select
                    name="class"
                    value={carData.class}
                    onChange={handleChange}
                    label="Class"
                  >
                    {Object.values(CAR_CLASSES).map((carClass) => (
                      <MenuItem key={carClass} value={carClass}>
                        {carClass.charAt(0).toUpperCase() + carClass.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required>
                  <InputLabel>Transmission</InputLabel>
                  <Select
                    name="transmission"
                    value={carData.transmission}
                    onChange={handleChange}
                    label="Transmission"
                  >
                    {Object.values(TRANSMISSION_TYPES).map((transmission) => (
                      <MenuItem key={transmission} value={transmission}>
                        {transmission.charAt(0).toUpperCase() +
                          transmission.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required>
                  <InputLabel>Fuel Type</InputLabel>
                  <Select
                    name="fueltype"
                    value={carData.fueltype}
                    onChange={handleChange}
                    label="Fuel Type"
                  >
                    {Object.values(FUEL_TYPES).map((fuel) => (
                      <MenuItem key={fuel} value={fuel}>
                        {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Registration Year"
                  name="registration"
                  value={carData.registration}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Registration Number"
                  name="regNumber"
                  value={carData.regNumber}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Number of Doors"
                  name="numberOfDoors"
                  value={carData.numberOfDoors}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 2, max: 6 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Seats"
                  name="seats"
                  value={carData.seats}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Engine Power"
                  name="enginePower"
                  value={carData.enginePower}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">bhp</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Engine"
                  name="engine"
                  value={carData.engine}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">c.c.</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                {/* <Typography> Add image</Typography> */}
                <TextField
                  fullWidth
                  label="Photo URL"
                  name="photoUrl"
                  value={carData.photoUrl}
                  onChange={handleChange}
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <ColorPicker
                  value={carData.color || ""}
                  onChange={handleChange}
                />
              </Grid>

              {/* Pricing Tiers Table */}
              <Grid item xs={12}>
                <PricingTiers
                  handleChange={handleChange}
                  setUpdatedCar={resubmitCars}
                  isAddcar={true}
                  defaultPrices={defaultPrices}
                />
              </Grid>
            </Grid>
          </DialogContent>
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
                disabled={loading}
                sx={{ py: 1.5, px: 4, minWidth: "140px" }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                variant="contained"
                color="primary"
                sx={{ py: 1.5, px: 4, minWidth: "140px" }}
              >
                Add Car
              </Button>
            </DialogActions>
          </Grid>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AddCarModal;

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
