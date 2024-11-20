import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Divider,
  FormControlLabel,
} from "@mui/material";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import MuiCalendar from "@app/components/Calendars/MuiCalendar";
import ConflictMessage from "./conflictMessage";
import Snackbar from "@app/components/common/Snackbar";
import { useMainContext } from "@app/Context";
import { functionToCheckDuplicates } from "@utils/functions";
import CalendarPicker from "@app/components/CarComponent/CalendarPicker";
import RenderConflictMessage from "@app/components/Admin/Order/RenderConflictInAddOrder";

import { analyzeDates, functionPendingDatesInRange } from "@utils/analyzeDates";
import MuiTimePicker from "@app/components/Calendars/MuiTimePicker";

import {
  changeRentalDates,
  toggleConfirmedStatus,
  updateCustomerInfo,
  getConfirmedOrders,
  addOrderNew,
} from "@utils/action";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone
const timeZone = "Europe/Athens";
dayjs.tz.setDefault(timeZone);

const AddOrder = ({ open, onClose, car, setUpdateStatus }) => {
  const { fetchAndUpdateOrders, isLoading, ordersByCarId, allOrders } =
    useMainContext();
  const carOrders = ordersByCarId(car?._id);
  const [bookDates, setBookedDates] = useState({ start: null, end: null });
  const [pendingDatesInRange, setPendingDatesInRange] = useState([]);
  const [startTime, setStartTime] = useState(dayjs());
  const [endTime, setEndTime] = useState(dayjs());

  const [loadingState, setLoadingState] = useState(false); // Loading state for booking process
  const [statusMessage, setStatusMessage] = useState("");

  const { confirmed, pending } = analyzeDates(carOrders);

  // Добавляем состояния для новых полей
  const [orderDetails, setOrderDetails] = useState({
    placeIn: "",
    placeOut: "",
    customerName: "",
    phone: "",
    email: "",
    totalPrice: 0,
    numberOfDays: 0,
    confirmed: false,
  });

  // Обработчик изменения полей
  const handleFieldChange = (field, value) => {
    setOrderDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleConfirmedStatus = () => {
    setOrderDetails((prev) => ({
      ...prev,
      confirmed: !prev.confirmed,
    }));
  };

  // Мемоизируем функцию проверки конфликтов
  const checkConflicts = useCallback(
    (startDate, endDate) => {
      if (!startDate || !endDate || !pending) return [];

      return functionPendingDatesInRange(
        pending,
        dayjs(startDate),
        dayjs(endDate)
      );
    },
    [pending]
  );

  const handleSetBookedDates = useCallback(
    (dates) => {
      if (!dates.start || !dates.end) {
        setBookedDates({ start: null, end: null });
        setPendingDatesInRange([]);
        return;
      }

      const startDate = dayjs(dates.start).format("YYYY-MM-DD");
      const endDate = dayjs(dates.end).format("YYYY-MM-DD");

      console.log("Updating dates:", {
        start: startDate,
        end: endDate,
      });

      // Проверяем конфликты перед установкой дат
      const conflicts = checkConflicts(dates.start, dates.end);

      // Обновляем оба состояния вместе
      setBookedDates({
        start: startDate,
        end: endDate,
      });
      setPendingDatesInRange(conflicts);

      if (conflicts?.length > 0) {
        console.warn(
          "В выбранном диапазоне есть уже забронированные даты ожидающие подтверждения:",
          conflicts.map((d) => dayjs(d.date).format("YYYY-MM-DD"))
        );
      }
    },
    [checkConflicts]
  );

  const handleBookingComplete = async () => {
    // Собираем данные для отправки
    const data = {
      carNumber: car?.carNumber,
      customerName: orderDetails.customerName,
      phone: orderDetails.phone,
      email: orderDetails.email,
      rentalStartDate: new Date(bookDates.start).toISOString(),
      rentalEndDate: new Date(bookDates.end).toISOString(),
      timeIn: startTime,
      timeOut: endTime,
      placeIn: orderDetails.placeIn,
      placeOut: orderDetails.placeOut,
      confirmed: orderDetails.confirmed,
    };

    try {
      // Пример отправки данных на сервер (например, через fetch)
      const response = await addOrderNew(data);

      console.log(response);

      await fetchAndUpdateOrders();

      setUpdateStatus({
        type: 200,
        message: response.data.message || "Order added",
      });

      setLoadingState(false);

      // Закрыть модальное окно после успешной отправки
      onClose();
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);
      setUpdateStatus({ type: 400, message: response.message });
      setLoadingState(false);
    }
  };

  const renderDateTimeSection = () => (
    <Box sx={{ mb: 3 }}>
      {/* <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
        Время & Дата & Место выдачи/забора
      </Typography> */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MuiCalendar
          carId={car?._id}
          orders={carOrders}
          isLoading={isLoading}
          setBookedDates={handleSetBookedDates}
        />
        {bookDates.start && bookDates.end && pendingDatesInRange.length > 0 && (
          <RenderConflictMessage
            pendingDatesInRange={pendingDatesInRange}
            startDate={bookDates.start}
            endDate={bookDates.end}
          />
        )}
        <MuiTimePicker
          startTime={startTime}
          endTime={endTime}
          setStartTime={setStartTime}
          setEndTime={setEndTime}
        />
      </LocalizationProvider>

      <TextField
        fullWidth
        margin="normal"
        label="Место выдачи"
        value={orderDetails.placeIn}
        onChange={(e) => handleFieldChange("placeIn", e.target.value)}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Место возврата"
        value={orderDetails.placeOut}
        onChange={(e) => handleFieldChange("placeOut", e.target.value)}
      />

      {/* <Box sx={{ mt: 2 }}>
        <Typography>Всего цена: {orderDetails.totalPrice}</Typography>
        <Typography>Кол-во дней: {orderDetails.numberOfDays}</Typography>
      </Box> */}
    </Box>
  );

  const renderCustomerSection = () => (
    <Box sx={{ mb: 3 }}>
      {/* <Typography variant="h6" sx={{ mb: 2 }}>
        Информация о клиенте
      </Typography> */}
      <TextField
        fullWidth
        margin="normal"
        label="Имя клиента"
        value={orderDetails.customerName}
        onChange={(e) => handleFieldChange("customerName", e.target.value)}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Телефон"
        value={orderDetails.phone}
        onChange={(e) => handleFieldChange("phone", e.target.value)}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Email"
        value={orderDetails.email}
        onChange={(e) => handleFieldChange("email", e.target.value)}
      />
    </Box>
  );

  const renderConfirmationButton = () => (
    <Button
      variant="contained"
      color={orderDetails.confirmed ? "success" : "error"}
      onClick={toggleConfirmedStatus}
      sx={{ width: "100%", mb: 2 }}
    >
      {orderDetails.confirmed
        ? "Бронирование подтверждено"
        : "Подтвердить бронирование"}
    </Button>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          padding: 2,
          margin: "auto",
          bgcolor: "background.paper",
          maxWidth: 600,
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <Typography variant="h6" color="primary.main">
          Add Order for {car?.model}
        </Typography>
        <Typography variant="body2" color="primary.main">
          Reg. Number: {car?.regNumber}
        </Typography>

        {renderConfirmationButton()}
        {renderDateTimeSection()}
        {renderCustomerSection()}

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleBookingComplete}
            disabled={
              !bookDates.start ||
              !bookDates.end ||
              !startTime ||
              !endTime ||
              !orderDetails.customerName ||
              !orderDetails.phone
            }
            sx={{ width: "100%" }}
          >
            Complete Booking
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddOrder;
