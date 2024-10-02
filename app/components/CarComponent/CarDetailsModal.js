import React from "react";
import { Modal, Box, Typography, Button, Grid } from "@mui/material";
import Image from "next/image";
import CarTypography from "../common/CarTypography";

const CarDetailsModal = ({ open, onClose, car, additionalDetails }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ textAlign: "center" }}
      aria-labelledby="car-details-modal-title"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 400 },
          maxHeight: "90vh",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          overflowY: "auto",
        }}
      >
        <Typography
          id="car-details-modal-title"
          variant="h6"
          component="h2"
          gutterBottom
        >
          Additional Car Details
        </Typography>
        <Grid container direction="column" spacing={2}>
          {additionalDetails.map((detail) => (
            <Grid item key={detail.key}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <Image
                    src={detail.icon}
                    alt={detail.label}
                    width={24}
                    height={24}
                  />
                </Grid>
                <Grid item>
                  <CarTypography>
                    {detail.label}: {detail.getValue(car)}
                  </CarTypography>
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
        <Button onClick={onClose} variant="contained" sx={{ mt: 3 }}>
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default CarDetailsModal;
