import React from "react";
import { Typography, Box, Button } from "@mui/material";
import dayjs from "dayjs";

const SuccessMessage = ({ submittedOrder, presetDates, onClose }) => {
  return (
    <Box>
      <Typography
        variant="h6"
        color="primary"
        textAlign="center"
        sx={{ textTransform: "uppercase" }}
      >
        Thank you for booking with us!
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        We have received your booking for the{" "}
        <strong>
          {submittedOrder?.model} {submittedOrder?.carNumber}
        </strong>{" "}
        from <strong>{dayjs(presetDates?.startDate).format("MMMM D")}</strong>{" "}
        to <strong>{dayjs(presetDates?.endDate).format("MMMM D")}</strong>.
      </Typography>
      <Typography
        textAlign="center"
        sx={{ mt: 3, letterSpacing: 0.1 }}
        variant="h5"
        color="primary.red"
      >
        Number of days: {submittedOrder.numberOfDays}{" "}
      </Typography>
      <Typography
        textAlign="center"
        sx={{ mb: 3, letterSpacing: 0.1 }}
        variant="h5"
        color="primary.red"
      >
        Total price : €{submittedOrder.totalPrice}{" "}
      </Typography>
      <Typography variant="body1" sx={{ mt: 1 }}>
        We will contact you within 24 hours to finalize the details.
      </Typography>
    </Box>
  );
};

export default SuccessMessage;
