import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
// import { DateRangePicker } from "@mui/x-date-pickers/DateRangePicker"; // Correct import
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"; // Correct import
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

// Styled form container
const FormContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

// Booking modal component
function BookingModal({ open, onClose, car, presetDates = null }) {
  const [startDate, setStartDate] = useState(presetDates?.startDate || null);
  const [endDate, setEndDate] = useState(presetDates?.endDate || null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleDateChange = (dateRange) => {
    setStartDate(dateRange[0]);
    setEndDate(dateRange[1]);
  };

  const handleSubmit = () => {
    // Handle form submission
    console.log({ car, startDate, endDate, name, email, phone });
    onClose(); // Close the modal after submission
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Book {car.title}</DialogTitle>
      <DialogContent>
        {presetDates ? (
          <>
            <Typography variant="body1">
              You are booking a {car.title} from {presetDates.startDate} till {presetDates.endDate}.
              Please input your name, email, and phone number so we can get in touch with you.
            </Typography>
            <FormContainer>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Phone Number"
                variant="outlined"
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </FormContainer>
          </>
        ) : (
          <>
            <Typography variant="body1">
              Please select your booking dates for the {car.title}:
            </Typography>
            {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateRangePicker
                startText="Start Date"
                endText="End Date"
                value={[startDate, endDate]}
                onChange={handleDateChange}
                calendars={2} // Displays 2 months side by side
                renderInput={(startProps, endProps) => (
                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <TextField {...startProps} fullWidth />
                    <TextField {...endProps} fullWidth />
                  </Box>
                )}
              />
            </LocalizationProvider> */}
            <FormContainer>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Phone Number"
                variant="outlined"
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </FormContainer>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Confirm Booking
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BookingModal;
