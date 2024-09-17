import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
} from "@mui/material";
import { addOrder } from "@utils/action";
import SuccessMessage from "./common/SuccessMessage";

// const { RangePicker } = DatePicker;

const getYearMonth = (date) => date.year() * 12 + date.month();

const disabledDate = (current, { from, type }) => {
  if (from) {
    const minDate = dayjs(from).subtract(6, "days");
    const maxDate = dayjs(from).add(6, "days");
    switch (type) {
      case "year":
        return (
          current.year() < minDate.year() || current.year() > maxDate.year()
        );
      case "month":
        return (
          getYearMonth(current) < getYearMonth(minDate) ||
          getYearMonth(current) > getYearMonth(maxDate)
        );
      default:
        return Math.abs(current.diff(from, "days")) >= 7;
    }
  }
  return false;
};

const BookingModal = ({
  open,
  onClose,
  car,
  presetDates = null,
  onSuccessfulBooking,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [dateRange, setDateRange] = useState([
    presetDates?.startDate ? dayjs(presetDates.startDate) : null,
    presetDates?.endDate ? dayjs(presetDates.endDate) : null,
  ]);

  useEffect(() => {
    if (presetDates?.startDate && presetDates?.endDate && car.pricePerDay) {
      const days =
        dayjs(presetDates.endDate).diff(dayjs(presetDates.startDate), "day") +
        1;
      setTotalPrice(days * car.pricePerDay);
    }
  }, [presetDates?.startDate, presetDates?.endDate, car.pricePerDay]);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhone = (phone) => {
    const re = /^\+?[0-9]\d{1,14}$/;
    return re.test(phone);
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!name) newErrors.name = "Name is required";
    if (!validateEmail(email)) newErrors.email = "Invalid email address";
    if (!validatePhone(phone)) newErrors.phone = "Invalid phone number";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        carNumber: car.carNumber,
        customerName: name,
        phone,
        email,
        rentalStartDate: presetDates?.startDate,
        rentalEndDate: presetDates?.endDate,
        totalPrice,
      };

      const result = await addOrder(orderData);
      setSubmittedOrder(result);
      console.log("Order added successfully:", result);
      setIsSubmitted(true); // Mark submission as successful

      // Call the callback function to trigger a re-fetch
      if (setIsSubmitted) {
        onSuccessfulBooking();
        setLoading(false);
      }
    } catch (error) {
      console.error("Error adding order:", error.message);
      setLoading(false);
      setErrors({ submit: "Failed to submit order. Please try again." });
    }
  };

  const resetForm = () => {
    // Reset all form states
    setName("");
    setEmail("");
    setPhone("");
    setErrors({});
    setIsSubmitted(false);
    setSubmittedOrder(null);
  };

  const handleModalClose = () => {
    if (isSubmitted) {
      resetForm();
    }

    // Close the modal
    onClose();
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
  };
  //to add something beautifull
  if (loading) {
    return <div>loading...</div>;
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle textAlign="center" mt="3">
        {isSubmitted ? "Booking Confirmed!" : `Book ${car.model}`}
      </DialogTitle>
      <DialogContent>
        {isSubmitted ? (
          <SuccessMessage
            submittedOrder={submittedOrder}
            presetDates={presetDates}
            onClose={onClose}
          />
        ) : (
          <Box>
            <Typography variant="body1">
              You are booking {car.model} from{" "}
              <Box
                component="span"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                {dayjs(presetDates?.startDate).format("MMMM D")}
              </Box>{" "}
              till{" "}
              <Box
                component="span"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                {dayjs(presetDates?.endDate).format("MMMM D")}
              </Box>
              .
            </Typography>

            <Box component="form" sx={{ "& .MuiTextField-root": { my: 1 } }}>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                error={!!errors.name}
                helperText={errors.name}
              />
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                error={!!errors.email}
                helperText={errors.email}
              />
              <TextField
                label="Phone Number"
                variant="outlined"
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Box>
            {errors.submit && (
              <Typography color="error" sx={{ mt: 2 }}>
                {errors.submit}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleModalClose}>
          {isSubmitted ? "OK" : "Cancel"}
        </Button>
        {!isSubmitted && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={
              !name ||
              !email ||
              !phone ||
              !presetDates?.startDate ||
              !presetDates?.endDate
            }
          >
            Confirm Booking
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BookingModal;
