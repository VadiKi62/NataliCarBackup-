import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Box,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { addOrderNew } from "@utils/action";
import SuccessMessage from "../common/SuccessMessage";
import sendEmail from "@utils/sendEmail";
import { setTimeToDatejs } from "@utils/functions";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useMainContext } from "../../Context";

// Extend dayjs with plugins
dayjs.extend(utc);

const BookingModal = ({
  open,
  onClose,
  car,
  presetDates = null,
  fetchAndUpdateOrders,
  isLoading,
  selectedTimes,
}) => {
  const { t } = useTranslation();
  const { company } = useMainContext();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [emailSent, setSuccessfullySent] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [submittedOrder, setSubmittedOrder] = useState(null);

  const [startTime, setStartTime] = useState(() =>
    setTimeToDatejs(presetDates?.startDate, selectedTimes?.start, true)
  );
  const [endTime, setEndTime] = useState(() =>
    setTimeToDatejs(presetDates?.endDate, selectedTimes?.end)
  );

  useEffect(() => {
    if (presetDates?.startDate && presetDates?.endDate) {
      setStartTime(
        setTimeToDatejs(presetDates?.startDate, selectedTimes?.start, true)
      );
      setEndTime(setTimeToDatejs(presetDates?.endDate, selectedTimes?.end));
    }
  }, [
    presetDates?.startDate,
    presetDates?.endDate,
    car.pricePerDay,
    selectedTimes,
  ]);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhone = (phone) => {
    const re = /^\+?[0-9]\d{1,14}$/;
    return re.test(phone);
  };

  const bookButtonRef = useRef(null);

  useEffect(() => {
    if (
      open &&
      !isSubmitted &&
      name &&
      email &&
      phone &&
      presetDates?.startDate &&
      presetDates?.endDate &&
      bookButtonRef.current
    ) {
      const timer = setTimeout(() => {
        bookButtonRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [
    open,
    isSubmitted,
    name,
    email,
    phone,
    presetDates?.startDate,
    presetDates?.endDate,
  ]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const newErrors = {};
    if (!name) newErrors.name = "Name is required";
    if (!validateEmail(email)) newErrors.email = "Invalid email address";
    if (!validatePhone(phone)) newErrors.phone = "Invalid phone number";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        carNumber: car.carNumber,
        customerName: name,
        phone,
        email,
        // Время заказа: 24-часовой формат, без AM/PM, как в EditOrderModal
        timeIn: dayjs.utc(
          dayjs(presetDates?.startDate).format("YYYY-MM-DD") +
            " " +
            startTime.format("HH:mm")
        ),
        timeOut: dayjs.utc(
          dayjs(presetDates?.endDate).format("YYYY-MM-DD") +
            " " +
            endTime.format("HH:mm")
        ),
        rentalStartDate: dayjs.utc(presetDates?.startDate).toDate(),
        rentalEndDate: dayjs.utc(presetDates?.endDate).toDate(),
        my_order: true,
      };

      const response = await addOrderNew(orderData);

      const prepareEmailData = (orderData, status) => {
        const formattedStartDate = dayjs
          .utc(orderData.rentalStartDate)
          .format("DD.MM.YYYY");
        const formattedEndDate = dayjs
          .utc(orderData.rentalEndDate)
          .format("DD.MM.YYYY");
        let title =
          status === "success"
            ? `Новое бронирование ${orderData.carNumber} ${orderData.carModel}`
            : `Бронирование с неподтвержденными датами ${orderData.carNumber} ${orderData.carModel}`;
        let statusMessage =
          status === "success"
            ? "Создано бронирование в свободные даты."
            : "Бронирование в ожидании подтверждения.";
        return {
          emailCompany: company.email,
          email: orderData.email,
          title: title,
          message: `${statusMessage}\nБронь с ${formattedStartDate} по ${formattedEndDate}. \n Кол-во дней : ${orderData.numberOfDays}  \n Сумма : ${response.data.totalPrice} евро. \n \n Данные машины :   ${orderData.carModel} regNumber : ${car.regNumber} \n \n Данные клиента : \n  Мейл : ${orderData.email}, \n Тел : ${orderData.phone} \n имя: ${orderData.customerName}`,
        };
      };

      const sendConfirmationEmail = async (formData) => {
        try {
          const emailResponse = await sendEmail(
            formData,
            company.email,
            company.useEmail
          );
          setSuccessfullySent(emailResponse.status === 200);
        } catch (emailError) {
          setSuccessfullySent(false);
        }
      };

      switch (response.status) {
        case "success":
          setSubmittedOrder(response.data);
          setIsSubmitted(true);
          fetchAndUpdateOrders();
          await sendConfirmationEmail(
            prepareEmailData(response.data, "success")
          );
          break;
        case "pending":
          setSubmittedOrder(response.data);
          setMessage(response.message);
          setIsSubmitted(true);
          fetchAndUpdateOrders();
          await sendConfirmationEmail(
            prepareEmailData(response.data, "pending")
          );
          break;
        case "conflict":
          setErrors({ submit: response.message });
          break;
        case "error":
          throw new Error(response.message);
        default:
          throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      setErrors({
        submit:
          error.message || "An error occurred while processing your request.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setErrors({});
    setIsSubmitted(false);
    setIsSubmitting(false);
    setSubmittedOrder(null);
    setSuccessfullySent(false);
    setMessage(null);
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {isLoading ? (
        <Box sx={{ display: "flex", alignContent: "center", p: 10 }}>
          <CircularProgress />
          <CircularProgress sx={{ color: "primary.green" }} />
          <CircularProgress sx={{ color: "primary.red" }} />
        </Box>
      ) : (
        <React.Fragment>
          <DialogTitle textAlign="center" mt="3">
            {t("order.book", { model: car.model })}
          </DialogTitle>
          <DialogContent>
            {isSubmitted ? (
              <SuccessMessage
                submittedOrder={submittedOrder}
                presetDates={presetDates}
                onClose={onClose}
                emailSent={emailSent}
                message={message}
              />
            ) : (
              <Box>
                <Typography variant="body1">
                  {t("order.youBook", { model: car.model })}
                  <Box
                    component="span"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    {dayjs(presetDates?.startDate).format("MMMM D")}
                  </Box>{" "}
                  {t("order.till")}
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
                  {/* Время в одной строке, 24-часовой формат */}
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <TextField
                      label={t("order.pickupTime")}
                      type="time"
                      value={startTime.format("HH:mm")}
                      onChange={(e) =>
                        setStartTime(dayjs(e.target.value, "HH:mm"))
                      }
                      sx={{ flex: 1 }}
                      size="small"
                    />
                    <TextField
                      label={t("order.returnTime")}
                      type="time"
                      value={endTime.format("HH:mm")}
                      onChange={(e) =>
                        setEndTime(dayjs(e.target.value, "HH:mm"))
                      }
                      sx={{ flex: 1 }}
                      size="small"
                    />
                  </Box>
                  <TextField
                    label={t("order.name")}
                    variant="outlined"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                  <TextField
                    label={t("order.email")}
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
                    label={t("order.phone")}
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
                {/* Кнопки внутри DialogContent, BOOK по центру и мигает */}
                <Box
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
                  <Button onClick={handleModalClose} variant="outlined">
                    {isSubmitted ? "OK" : t("basic.cancel")}
                  </Button>
                  {!isSubmitted && (
                    <Button
                      ref={bookButtonRef}
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                      disabled={
                        isSubmitting ||
                        !name ||
                        !email ||
                        !phone ||
                        !presetDates?.startDate ||
                        !presetDates?.endDate
                      }
                      startIcon={
                        isSubmitting ? <CircularProgress size={20} /> : null
                      }
                      sx={{
                        backgroundColor: "#00e676",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                        padding: "12px 32px",
                        minWidth: "200px",
                        margin: "0 auto",
                        animation: "bookButtonPulse 1.5s ease-in-out infinite",
                        display: "block",
                        "&:hover": {
                          backgroundColor: "#00c853",
                          animation: "none",
                        },
                        "&:disabled": {
                          backgroundColor: "#grey.400",
                          animation: "none",
                        },
                        "@keyframes bookButtonPulse": {
                          "0%": {
                            backgroundColor: "#00e676",
                            boxShadow: "0 0 10px rgba(0, 230, 118, 0.7)",
                            transform: "scale(1)",
                          },
                          "50%": {
                            backgroundColor: "#4cff4c",
                            boxShadow: "0 0 20px rgba(76, 255, 76, 0.9)",
                            transform: "scale(1.05)",
                          },
                          "100%": {
                            backgroundColor: "#00e676",
                            boxShadow: "0 0 10px rgba(0, 230, 118, 0.7)",
                            transform: "scale(1)",
                          },
                        },
                      }}
                    >
                      {isSubmitting
                        ? t("order.processing") || "Processing..."
                        : t("order.confirmBooking")}
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
        </React.Fragment>
      )}
    </Dialog>
  );
};

export default BookingModal;
