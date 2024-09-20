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
  CircularProgress,
} from "@mui/material";
import { addOrder, addOrderNew } from "@utils/action";
import SuccessMessage from "./common/SuccessMessage";
import sendEmail from "@utils/sendEmail";

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
  resubmitOrdersData,
  isLoading,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [emailSent, setSuccessfullySent] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
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

    // Validation checks
    if (!name) newErrors.name = "Name is required";
    if (!validateEmail(email)) newErrors.email = "Invalid email address";
    if (!validatePhone(phone)) newErrors.phone = "Invalid phone number";

    // If there are validation errors, set them and return early
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const orderData = {
        carNumber: car.carNumber,
        customerName: name,
        phone,
        email,
        rentalStartDate: presetDates?.startDate,
        rentalEndDate: presetDates?.endDate,
        totalPrice,
      };

      const response = await addOrderNew(orderData);

      console.log("response ORDER", response);

      const prepareEmailData = (orderData, status) => {
        const formattedStartDate = dayjs(orderData.rentalStartDate).format(
          "DD.MM.YYYY"
        );
        const formattedEndDate = dayjs(orderData.rentalEndDate).format(
          "DD.MM.YYYY"
        );

        let title =
          status === "success"
            ? `Новое бронирование ${orderData.carNumber} ${orderData.carModel}`
            : `Ожидающее бронирование ${orderData.carNumber} ${orderData.carModel}`;

        let statusMessage =
          status === "success"
            ? "Бронирование cо свободными датами."
            : "Бронирование в ожидании подтверждения.";

        return {
          email: orderData.email,
          title: title,
          message: `${statusMessage}\nБронь с ${formattedStartDate} по ${formattedEndDate}. \n Кол-во дней : ${orderData.numberOfDays}  \n Сумма : ${orderData.totalPrice} евро. \n \n Данные машины :   ${orderData.carNumber} ${orderData.carModel} id : ${orderData.car} \n \n Данные клиента : \n  Мейл : ${orderData.email}, \n Тел : ${orderData.phone} \n имя: ${orderData.customerName}`,
        };
      };

      const sendConfirmationEmail = async (formData) => {
        try {
          const emailResponse = await sendEmail(formData);
          if (emailResponse.status === 200) {
            setSuccessfullySent(true);
          } else {
            setSuccessfullySent(false);
          }
        } catch (emailError) {
          console.error("Error sending email:", emailError);
          setSuccessfullySent(false);
        }
      };

      // Handle different response statuses
      switch (response.status) {
        case "success":
          setSubmittedOrder(response.data);
          console.log("Order added successfully:", response.data);
          setIsSubmitted(true);
          resubmitOrdersData();
          await sendConfirmationEmail(
            prepareEmailData(response.data, "success")
          );
          break;

        case "pending":
          console.warn("Order is pending:", response.message);
          setErrors({ submit: response.message });
          await sendConfirmationEmail(
            prepareEmailData(response.data, "pending")
          );
          break;

        case "conflict":
          console.warn("Conflict with booking:", response.message);
          setErrors({ submit: response.message });
          break;

        case "error":
          throw new Error(response.message);

        default:
          throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error adding order:", error.message);
      setErrors({
        submit:
          error.message || "An error occurred while processing your request.",
      });
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
    setSuccessfullySent(false);
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {isLoading ? (
        <Box sx={{ display: "flex", alignContent: "center", p: 10 }}>
          {" "}
          <CircularProgress />
          <CircularProgress sx={{ color: "primary.green" }} />
          <CircularProgress sx={{ color: "primary.red" }} />
        </Box>
      ) : (
        <>
          <DialogTitle textAlign="center" mt="3">
            {isSubmitted ? "Booking Confirmed!" : `Book ${car.model}`}
          </DialogTitle>
          <DialogContent>
            {isSubmitted ? (
              <SuccessMessage
                submittedOrder={submittedOrder}
                presetDates={presetDates}
                onClose={onClose}
                emailSent={emailSent}
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

                <Box
                  component="form"
                  sx={{ "& .MuiTextField-root": { my: 1 } }}
                >
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
        </>
      )}
    </Dialog>
  );
};

export default BookingModal;
