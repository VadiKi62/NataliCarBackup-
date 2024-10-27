import React, { useState, useEffect, useTransition, useRef } from "react";
import { styled, useTheme } from "@mui/material/styles";
import {
  Paper,
  Box,
  Typography,
  Stack,
  CircularProgress,
  Button,
} from "@mui/material";
import EditCarModal from "./EditCarModal";
import DefaultButton from "../../common/DefaultButton";
import { CldImage } from "next-cloudinary";
import { useMainContext } from "@app/Context";

const StyledCarItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  maxWidth: 400,
  zIndex: 22,
  display: "flex",
  justifyContent: "space-evenly",
  bgColor: "black",

  boxShadow: theme.shadows[4],
  transition: "transform 0.3s",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[5],
  },
  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 950,
    padding: theme.spacing(5),
  },
}));
const Wrapper = styled(Box)(({ theme }) => ({
  justifyContent: "center",
  alignItems: "center",
  alignContent: "center",
  width: "50%",
  margin: 5,
}));
const CarImage = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: "auto",
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",

  [theme.breakpoints.up("md")]: {
    width: 450,
    height: 300,
  },
}));
const CarDetails = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  margin: 11,
  textAlign: "center",
  // width: "auto",
}));
const CarTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  marginTop: theme.spacing(1),
}));
const CarReg = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  marginTop: theme.spacing(1),
  border: "1px solid black",
  // minWidth: "200px",
}));

function CarItem({ car, onCarDelete, setUpdateStatus }) {
  const { updateCarInContext, setIsLoading } = useMainContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [updatedCar, setUpdatedCar] = useState({ ...car });
  const [previewImage, setPreviewImage] = useState(null);
  const [hovered, setHovered] = useState(false);
  const fileInputRef = useRef(null);

  // Manage image preview and upload
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  const handleImageUpload = async () => {
    if (!fileInputRef.current.files[0]) return;
    const file = fileInputRef.current.files[0];
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
        const newPhotoUrl = data.data;
        setUpdatedCar((prev) => ({ ...prev, photoUrl: newPhotoUrl }));
        const response = await updateCarInContext({
          ...updatedCar,
          photoUrl: newPhotoUrl,
        });
        setUpdateStatus({ type: response.type, message: response.message });
        setPreviewImage(null); // Clear preview after successful upload
      } else {
        setUpdateStatus({
          type: 400,
          message: "Image NOT uploaded successfully",
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Car details update
  const handleCarsUpdate = async () => {
    const response = await updateCarInContext(updatedCar);
    setUpdateStatus({ type: response.type, message: response.message });
  };

  // Edit and Delete handlers
  const handleEditToggle = () => setModalOpen(true);
  const handleModalClose = () => {
    setModalOpen(false);
    setUpdateStatus(null);
  };

  const handleDelete = () => {
    if (window.confirm(`Вы уверены что хотите удалить ${car.model}?`)) {
      onCarDelete(car._id);
    }
  };

  return (
    <StyledCarItem elevation={3}>
      {car?.photoUrl && (
        <CarImage
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ position: "relative" }}
        >
          {previewImage ? (
            <img
              src={previewImage}
              alt="Preview"
              style={{ objectFit: "contain", width: "100%", height: "auto" }}
            />
          ) : (
            <CldImage
              src={car.photoUrl}
              alt={`Natali-Cars-${car.model}`}
              width="450"
              height="300"
              crop="fill"
              priority
              sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "contain", width: "100%", height: "auto" }}
            />
          )}
          {/* Overlay with Upload Button */}
          {hovered && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(0, 0, 0, 0.6)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Button
                variant="contained"
                onClick={() => fileInputRef.current.click()}
                sx={{
                  color: "white",
                  backgroundColor: "primary.main",
                  mb: 1,
                  p: 1,
                }}
              >
                Select New Photo
              </Button>
              {previewImage && (
                <Stack spacing={1}>
                  <Button
                    variant="contained"
                    onClick={handleImageUpload}
                    sx={{
                      color: "white",
                      backgroundColor: "primary.green",
                      p: 1,
                    }}
                  >
                    Save Photo
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setPreviewImage(null)}
                    sx={{
                      color: "white",
                      backgroundColor: "primary.red",
                      p: 1,
                    }}
                  >
                    Cancel
                  </Button>
                </Stack>
              )}
            </Box>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            style={{ display: "none" }}
          />
        </CarImage>
      )}
      <Wrapper>
        <Stack sx={{ flexDirection: "column" }}>
          <CarDetails>
            <CarTitle>{car.model}</CarTitle>
            <CarReg>{car.regNumber}</CarReg>
          </CarDetails>
          <DefaultButton
            onClick={handleDelete}
            relative
            sx={{ backgroundColor: "primary.main", color: "white" }}
          >
            Удалить эту машину
          </DefaultButton>
          <DefaultButton relative onClick={handleEditToggle}>
            Редактировать
          </DefaultButton>
        </Stack>
      </Wrapper>
      <EditCarModal
        open={modalOpen}
        onClose={handleModalClose}
        updatedCar={updatedCar}
        handleChange={(e) =>
          setUpdatedCar((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
          }))
        }
        handleUpdate={handleCarsUpdate}
        handleCheckboxChange={(e) =>
          setUpdatedCar((prev) => ({
            ...prev,
            [e.target.name]: e.target.checked,
          }))
        }
      />
    </StyledCarItem>
  );
}

export default CarItem;
