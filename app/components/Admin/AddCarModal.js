import React, { useState } from "react";
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
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import PricingTiers from "./PricingTiers";
import { useMainContext } from "@app/Context";

const AddCarModal = ({
  open,
  onClose,
  car,
  setUpdateStatus,
  fetchAndUpdateCars,
}) => {
  const [carData, setCarData] = useState({
    carNumber: "",
    model: "",
    sort: 999,
    class: "",
    transmission: "",
    fueltype: "",
    seats: 5,
    registration: 2016,
    regNumber: "",
    color: "",
    numberOfDoors: 4,
    airConditioning: true,
    enginePower: "",
    engine: "1.500",
    pricingTiers: car?.pricingTiers,
  });

  const [selectedImage, setSelectedImage] = useState(null);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setCarData((prevData) => ({
      ...prevData,
      [name]: e.target.type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]); // Save the selected image file
  };

  const handlePricingTierChange = (season, day, price) => {
    setCarData((prevData) => {
      const updatedPricingTiers = { ...prevData.pricingTiers };

      // Update the price for the specific season and day
      updatedPricingTiers[season] = {
        ...updatedPricingTiers[season],
        days: {
          ...updatedPricingTiers[season].days,
          [day]: price,
        },
      };

      return {
        ...prevData,
        pricingTiers: updatedPricingTiers,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      // Append all the carData fields to formData
      formData.append("carNumber", carData.carNumber);
      formData.append("model", carData.model);
      formData.append("class", carData.class);
      formData.append("transmission", carData.transmission);
      formData.append("fueltype", carData.fueltype || "");
      formData.append("seats", String(carData.seats));
      formData.append("numberOfDoors", String(carData.numberOfDoors));
      formData.append("airConditioning", String(carData.airConditioning));
      formData.append("enginePower", String(carData.enginePower));

      // Append the pricing tiers as a JSON string
      formData.append("pricingTiers", JSON.stringify(carData.pricingTiers));

      // Append the image file if selected
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
        onClose();
        await fetchAndUpdateCars();
      }
    } catch (error) {
      setUpdateStatus({ message: error.message, type: 400 });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Add New Car</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Car Number"
                  name="carNumber"
                  value={carData.carNumber}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Model"
                  name="model"
                  value={carData.model}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography> Add image</Typography>
                {/* <TextField
                  fullWidth
                  label="Photo URL"
                  name="photoUrl"
                  value={carData.photoUrl}
                  onChange={handleChange}
                /> */}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange} // Set the selected image
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Sort"
                  name="sort"
                  value={carData.sort}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Class</InputLabel>
                  <Select
                    name="class"
                    value={carData.class}
                    onChange={handleChange}
                    label="Class"
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
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Transmission</InputLabel>
                  <Select
                    name="transmission"
                    value={carData.transmission}
                    onChange={handleChange}
                    label="Transmission"
                  >
                    <MenuItem value="Automatic">Automatic</MenuItem>
                    <MenuItem value="Manual">Manual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Fuel Type</InputLabel>
                  <Select
                    name="fueltype"
                    value={carData.fueltype}
                    onChange={handleChange}
                    label="Fuel Type"
                  >
                    {[
                      "Diesel",
                      "Petrol",
                      "Natural Gas",
                      "Hybrid Diesel",
                      "Hybrid Petrol",
                    ].map((fuel) => (
                      <MenuItem key={fuel} value={fuel}>
                        {fuel}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Registration Year"
                  name="registration"
                  value={carData.registration}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Registration Number"
                  name="regNumber"
                  value={carData.regNumber}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Color"
                  name="color"
                  value={carData.color}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Engine Power"
                  name="enginePower"
                  value={carData.enginePower}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Engine"
                  name="engine"
                  value={carData.engine}
                  onChange={handleChange}
                />
              </Grid>
              {/* Pricing Tiers Table */}
              <Grid item xs={12}>
                <PricingTiers
                  car={car} // Pass the car data to the pricing table
                  handlePricingTierChange={handlePricingTierChange} // Handle updates from the table
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Add Car
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AddCarModal;
