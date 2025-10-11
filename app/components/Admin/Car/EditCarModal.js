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
  Autocomplete,
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
import CarImageUpload from "../../common/AddImageComponent";
import { useTranslation } from "react-i18next";

const EditCarModal = ({
  open,
  onClose,
  updatedCar,
  handleChange,
  handleUpdate,
  handleCheckboxChange,
  setUpdatedCar,
  //updateCarInContext,
}) => {
  // Диагностика: выводим объект updatedCar в консоль при каждом рендере
  // console.log('EditCarModal updatedCar:', updatedCar);

  const { updateCarInContext, setUpdateStatus, updateStatus } =
    useMainContext();

  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(updatedCar.photoUrl || "");
  const [photoUrl, setPhotoUrl] = useState(updatedCar.photoUrl || "");
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
      if (data.success) {
        // Update the photoUrl state
        setPhotoUrl(data.data);

        // Update the car in the context
        const response = await updateCarInContext({
          ...updatedCar,
          photoUrl: data.data,
        });
        setUpdateStatus({
          type: response.type,
          message: response.message,
          data: response.data,
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
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={handleCloseModal} fullWidth maxWidth="lg">
      {/* <Box sx={{ p: 3, position: "relative" }}> */}
      <Box
        sx={{ opacity: isLoading ? 0.3 : 1, transition: "opacity 0.2s", p: 2 }}
      >
        <DialogTitle>{t("carPark.updateCar")}</DialogTitle>
        <Grid container spacing={3} sx={{ flexGrow: 1 }}>
          {/* Column 1 */}
          <Grid item xs={12} sm={3}>
            <Stack spacing={3}>
              <RenderTextField
                name="model"
                label={t("car.model")}
                defaultValue="Toyota"
                updatedCar={updatedCar}
                handleChange={handleChange}
                isLoading={isLoading}
                required
              />
              <RenderSelectField
                name="transmission"
                label={t("car.transmission")}
                options={Object.values(TRANSMISSION_TYPES)}
                required
                updatedCar={updatedCar}
                handleChange={handleChange}
                isLoading={isLoading}
              />
              <RenderTextField
                type="number"
                name="seats"
                label={t("car.seats")}
                defaultValue={updatedCar.seats}
                updatedCar={updatedCar}
                handleChange={handleChange}
                isLoading={isLoading}
              />
              <RenderTextField
                type="number"
                name="PriceChildSeats"
                label={t("car.childSeatsPrice") || "Цена детских кресел"}
                defaultValue={updatedCar.PriceChildSeats}
                updatedCar={updatedCar}
                handleChange={handleChange}
                isLoading={isLoading}
              />{" "}
              <RenderTextField
                type="number"
                name="PriceKacko"
                label={t("car.KackoPrice") || "Цена КАСКО в день"}
                //label="Цена КАСКО в день"
                defaultValue={updatedCar.PriceKacko}
                updatedCar={updatedCar}
                handleChange={handleChange}
                isLoading={isLoading}
              />
              <RenderTextField
                type="number"
                name="deposit"
                label={t("car.deposit") || "Залог, €"}
                defaultValue={
                  typeof updatedCar.deposit !== "undefined"
                    ? updatedCar.deposit
                    : ""
                }
                updatedCar={updatedCar}
                handleChange={handleChange}
                isLoading={isLoading}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Stack spacing={3}>
              <RenderTextField
                name="registration"
                label={t("car.reg-year")}
                defaultValue={updatedCar.registration}
                type="number"
                updatedCar={updatedCar}
                handleChange={handleChange}
                isLoading={isLoading}
              />
              <RenderSelectField
                name="fueltype"
                label={t("car.fuel")}
                options={Object.values(FUEL_TYPES)}
                updatedCar={updatedCar}
                handleChange={handleChange}
                isLoading={isLoading}
              />
              <RenderTextField
                type="number"
                name="numberOfDoors"
                label={t("car.doors")}
                defaultValue={updatedCar.numberOfDoors}
                updatedCar={updatedCar}
                handleChange={handleChange}
                isLoading={isLoading}
              />
              <RenderTextField
                type="number"
                name="franchise"
                label={t("car.franchise") || "Франшиза"}
                defaultValue={updatedCar.franchise}
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
                name="regNumber"
                label={t("car.reg-numb")}
                defaultValue={updatedCar.regNumber}
                updatedCar={updatedCar}
                handleChange={handleChange}
                isLoading={isLoading}
              />
              <RenderTextField
                type="number"
                name="engine"
                label={t("car.engine")}
                defaultValue={updatedCar.enginePower}
                updatedCar={updatedCar}
                handleChange={handleChange}
                isLoading={isLoading}
                adornment="c.c."
              />
              <Autocomplete
                freeSolo
                options={Object.values(PREDEFINED_COLORS)}
                value={updatedCar.color || ""}
                getOptionLabel={(option) =>
                  typeof option === "string" && option.length > 0
                    ? option.charAt(0).toUpperCase() + option.slice(1)
                    : option
                }
                onChange={(_, newValue) => {
                  handleChange({
                    target: {
                      name: "color",
                      value: (newValue || "").toLowerCase(),
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("car.color") || "Цвет"}
                    name="color"
                    disabled={isLoading}
                    onChange={(e) => {
                      handleChange({
                        target: {
                          name: "color",
                          value: e.target.value.toLowerCase(),
                        },
                      });
                    }}
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={3}>
            <RenderSelectField
              name="class"
              label={t("car.class")}
              options={Object.values(CAR_CLASSES)}
              required
              updatedCar={updatedCar}
              handleChange={handleChange}
              isLoading={isLoading}
            />
            <RenderTextField
              type="number"
              name="enginePower"
              label={t("car.engine-pow")}
              defaultValue={updatedCar.enginePower}
              updatedCar={updatedCar}
              handleChange={handleChange}
              isLoading={isLoading}
              adornment="bhp"
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
              label={t("car.air")}
              sx={{ my: 2 }}
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
                {t("basic.cancel")}
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
                color="primary"
                disabled={isLoading}
                sx={{ py: 1.5, px: 4, minWidth: "140px" }}
              >
                {t("basic.save")}
              </Button>
            </DialogActions>
          </Grid>
        </Grid>
      </Box>
      {/* </Box> */}
    </Dialog>
  );
};

export default EditCarModal;
