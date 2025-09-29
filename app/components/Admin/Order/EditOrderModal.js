import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import ConflictMessage from "./conflictMessage";
import Snackbar from "@app/components/common/Snackbar";
import { useMainContext } from "@app/Context";
import TimePicker from "@app/components/Calendars/MuiTimePicker";
import { calculateAvailableTimes } from "@utils/functions";
import { companyData } from "@utils/companyData";

import {
  changeRentalDates,
  toggleConfirmedStatus,
  updateCustomerInfo,
  getConfirmedOrders,
} from "@utils/action";
import { RenderSelectField } from "@app/components/common/Fields";
import { useTranslation } from "react-i18next";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone
const timeZone = "Europe/Athens";
dayjs.tz.setDefault(timeZone);

const EditOrderModal = ({
  open,
  onClose,
  order,
  onSave,
  setCarOrders,
  isConflictOrder,
  setIsConflictOrder,
  startEndDates,
  cars, // <-- список автомобилей
}) => {
  const { allOrders, fetchAndUpdateOrders, company } = useMainContext();
  const locations = company.locations.map((loc) => loc.name);
  const [editedOrder, setEditedOrder] = useState(order);
  const [loading, setLoading] = useState(true);
  const [conflictMessage1, setConflictMessage1] = useState(null);
  const [conflictMessage2, setConflictMessage2] = useState(null);
  const [conflictMessage3, setConflictMessage3] = useState(null);
  const [timeInMessage, setTimeInMessage] = useState(null);
  const [timeOutMessage, setTimeOutMessage] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [startTime, setStartTime] = useState(
    editedOrder?.timeIn || editedOrder.rentalStartDate
  );
  const [endTime, setEndTime] = useState(
    editedOrder?.timeOut || editedOrder.rentalEndDate
  );
  const [availableTimes, setAvailableTimes] = useState({
    availableStart: null,
    availableEnd: null,
    hourStart: null,
    minuteStart: null,
    hourEnd: null,
    minuteEnd: null,
  });

  useEffect(() => {
    if (editedOrder?.rentalStartDate) {
      const {
        availableStart,
        availableEnd,
        hourStart,
        minuteStart,
        hourEnd,
        minuteEnd,
      } = calculateAvailableTimes(
        startEndDates,
        editedOrder?.timeIn,
        editedOrder?.timeOut,
        editedOrder?._id
      );
      setAvailableTimes({
        availableStart,
        availableEnd,
        hourStart,
        minuteStart,
        hourEnd,
        minuteEnd,
      });
    }
  }, [
    editedOrder?.rentalStartDate,
    editedOrder?.timeIn,
    editedOrder?.timeOut,
    editedOrder?._id,
    startEndDates,
  ]);

  useEffect(() => {
    if (order?.hasConflictDates) {
      const ordersIdSet = new Set(order?.hasConflictDates);
      const checkConflicts = async () => {
        const isConflict = await getConfirmedOrders([...ordersIdSet]);
        if (isConflict) {
          setIsConflictOrder(true);
        }
      };
      checkConflicts();
    }
  }, [order]);

  const handleDelete = async () => {
    const isConfirmed = window.confirm(t("order.sureDelOrder"));
    if (!isConfirmed) return;

    setIsUpdating(true);
    setUpdateMessage("");
    setAvailableTimes(null);

    try {
      const response = await fetch(`/api/order/deleteOne/${editedOrder._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to delete order`);
      }

      setCarOrders &&
        setCarOrders((prevOrders) =>
          prevOrders.filter((order) => order._id !== editedOrder._id)
        );
      // 🔹 Перезагружаем список заказов из базы, чтобы таблица обновилась
      await fetchAndUpdateOrders();

      showMessage("Order deleted successfully.");
      onClose();
    } catch (error) {
      console.error("Error deleting order:", error);
      setUpdateMessage("Failed to delete order. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (order) {
      const adjustedOrder = {
        ...order,
        rentalStartDate: dayjs(order.rentalStartDate),
        rentalEndDate: dayjs(order.rentalEndDate),
        // ИСПРАВЛЕНИЕ: читаем UTC время напрямую без преобразований
        timeIn: dayjs.utc(order.timeIn),
        timeOut: dayjs.utc(order.timeOut),
      };
      setEditedOrder(adjustedOrder);

      // ИСПРАВЛЕНИЕ: устанавливаем время напрямую из UTC
      setStartTime(dayjs.utc(order.timeIn));
      setEndTime(dayjs.utc(order.timeOut));

      if (order.hasConflictDates && order.hasConflictDates.length > 0) {
        const conflictingOrderIds = new Set(order.hasConflictDates);
        const conflicts = allOrders.filter((existingOrder) =>
          conflictingOrderIds.has(existingOrder._id)
        );
        setConflictMessage3(conflicts);
      }

      setLoading(false);
    }
  }, [order]);

  const onCloseModalEdit = () => {
    onClose();
    setConflictMessage2(null);
    setConflictMessage1(null);
    setAvailableTimes(null);
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setUpdateMessage(null);
  };

  const showMessage = (message, isError = false) => {
    setUpdateMessage(message);
    setSnackbarOpen(true);
    if (!isError) {
      setTimeout(() => {
        setSnackbarOpen(false);
        setUpdateMessage(null);
      }, 3000);
    }
  };

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);

  const handleConfirmationToggle = async () => {
    setIsUpdating(true);
    setUpdateMessage(null);
    try {
      const { updatedOrder, message } = await toggleConfirmedStatus(
        editedOrder._id
      );

      setEditedOrder((prevOrder) => ({
        ...prevOrder,
        confirmed: updatedOrder?.confirmed,
      }));

      showMessage(message);
      onSave(updatedOrder);
    } catch (error) {
      console.error("Error toggling confirmation status:", error);
      setUpdateMessage(error.message || "Статус не обновлен. Ошибка сервера.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDateUpdate = async () => {
    setIsUpdating(true);
    try {
      const selectedCar = cars.find((c) => c._id === editedOrder.car);

      const datesToSend = {
        rentalStartDate: dayjs(editedOrder.rentalStartDate).toDate(),
        rentalEndDate: dayjs(editedOrder.rentalEndDate).toDate(),
        // ИСПРАВЛЕНИЕ: правильно создаем UTC время для сохранения
        timeIn: dayjs
          .utc(
            editedOrder.rentalStartDate.format("YYYY-MM-DD") +
              " " +
              startTime.format("HH:mm")
          )
          .toDate(),
        timeOut: dayjs
          .utc(
            editedOrder.rentalEndDate.format("YYYY-MM-DD") +
              " " +
              endTime.format("HH:mm")
          )
          .toDate(),
        car: editedOrder.car,
        carNumber: selectedCar ? selectedCar.carNumber : undefined,
        placeIn: editedOrder.placeIn,
        placeOut: editedOrder.placeOut,
        ChildSeats: editedOrder.ChildSeats, // ДОБАВИТЬ!
        insurance: editedOrder.insurance, // ДОБАВИТЬ!
        franchiseOrder: editedOrder.franchiseOrder, // <-- добавляем франшизу заказа
      };

      const response = await changeRentalDates(
        editedOrder._id,
        datesToSend.rentalStartDate,
        datesToSend.rentalEndDate,
        datesToSend.timeIn,
        datesToSend.timeOut,
        editedOrder.placeIn,
        editedOrder.placeOut,
        datesToSend.car,
        datesToSend.carNumber,
        datesToSend.ChildSeats,
        datesToSend.insurance,
        datesToSend.franchiseOrder // <-- передаем франшизу заказа
      );
      showMessage(response.message);
      if (response.status == 202) {
        setConflictMessage1(response.conflicts);
        onSave(response.updatedOrder);
      }
      if (response.status == 201) {
        onSave(response.updatedOrder);
      }
      if (response.status == 408) {
        const isStartConflict = response.conflicts.start.utc();
        const isEndConflict = response.conflicts.end.utc();
        isStartConflict &&
          setTimeInMessage(
            `Car is Not available before ${dayjs(isStartConflict).format(
              "HH:MM"
            )}`
          );
        isEndConflict &&
          setTimeOutMessage(
            `Car is Not available after ${dayjs(isEndConflict).format("HH:MM")}`
          );
      }
    } catch (error) {
      console.error("Error updating dates:", error);
      setUpdateMessage(error?.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCustomerUpdate = async () => {
    setIsUpdating(true);
    try {
      // Логгируем email перед отправкой
      console.log("EditOrderModal: email для сохранения:", editedOrder.email);

      // Явно передаем пустую строку, если email пустой или null
      const updates = {
        customerName: editedOrder.customerName,
        phone: editedOrder.phone,
        email: editedOrder.email ? editedOrder.email : "",
      };

      console.log("EditOrderModal: updates для updateCustomerInfo:", updates);

      const response = await updateCustomerInfo(editedOrder._id, updates);

      // Логгируем ответ сервера
      console.log("EditOrderModal: response от updateCustomerInfo:", response);

      showMessage(response.message);
      onSave(response.updatedOrder);
    } catch (error) {
      console.error("Error updating customer info:", error);
      setUpdateMessage("Failed to update customer details.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangeSelectedBox = (e) => {
    const { name, value } = e.target;
    setEditedOrder({ ...editedOrder, [name]: value });
  };

  const handleChange = (field, value) => {
    const defaultStartHour = companyData.defaultStart.slice(0, 2);
    const defaultStartMinute = companyData.defaultStart.slice(-2);

    const defaultEndHour = companyData.defaultEnd.slice(0, 2);
    const defaultEndMinute = companyData.defaultEnd.slice(-2);
    let newValue = value;

    if (field === "rentalStartDate" || field === "rentalEndDate") {
      const isValidDate = dayjs(value, "YYYY-MM-DD", true).isValid();
      if (isValidDate) {
        newValue = dayjs(value);

        if (field === "rentalStartDate") {
          newValue = newValue.hour(defaultStartHour).minute(defaultStartMinute);
        } else if (field === "rentalEndDate") {
          newValue = newValue.hour(defaultEndHour).minute(defaultEndMinute);
        }
      } else {
        console.error("Invalid date format");
        return;
      }
    }

    setEditedOrder({ ...editedOrder, [field]: newValue });
  };

  const renderField = (label, field, type = "text") => {
    if (!editedOrder) return null;

    let inputType = type;
    let value;

    switch (type) {
      case "date":
        value = editedOrder[field].format("YYYY-MM-DD");
        inputType = "date";
        break;
      case "time":
        value = editedOrder[field].format("HH:mm");
        inputType = "time";
        break;
      case "boolean":
        value = editedOrder[field] ? "Yes" : "No";
        inputType = "checkbox";
        break;
      default:
        value = editedOrder[field];
    }

    return (
      <Box sx={{ mb: 1 }}>
        <Typography
          variant="body2"
          component="span"
          sx={{ fontWeight: "bold", mr: 1 }}
        >
          {label}:
        </Typography>
        <TextField
          size="small"
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            handleChange(field, newValue);
          }}
          type={inputType}
        />
      </Box>
    );
  };

  const { t } = useTranslation();

  return (
    <>
      <Paper
        sx={{
          width: { xs: 500, md: 700 },
          maxWidth: "90%",
          p: { xs: 2, md: 4 },
          maxHeight: "90vh",
          overflow: "auto",
          border: isConflictOrder ? "4px solid #FF0000" : "none",
          animation: isConflictOrder ? "pulse 2s infinite" : "none",
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="h5" gutterBottom>
              {t("order.editOrder")} # {order?._id.slice(-4)}
            </Typography>
            <Box
              display="flex"
              alignContent="center"
              alignItems="center"
              justifyContent="right"
            >
              <Typography variant="body1" sx={{ alignSelf: "center" }}>
                {t("order.price")} {editedOrder?.totalPrice}€ |{" "}
                {t("order.daysNumber")} {editedOrder?.numberOfDays}
              </Typography>
            </Box>

            {/* Отладочная информация для поля my_order - ЗАКОММЕНТИРОВАНО */}
            {/*
            <Box
              display="flex"
              alignContent="center"
              alignItems="center"
              justifyContent="center"
              sx={{ 
                bgcolor: editedOrder?.my_order ? '#e8f5e8' : '#fff5f5',
                p: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: editedOrder?.my_order ? '#4caf50' : '#f44336',
                my: 1
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                🐛 DEBUG: my_order = {editedOrder?.my_order ? 'true' : 'false'}
                {editedOrder?.my_order ? ' (Заказ с главной страницы)' : ' (Админский заказ)'}
              </Typography>
            </Box>
            */}

            <Divider sx={{ my: 2 }} />

            {/* --- ВЫПАДАЮЩИЙ СПИСОК ДЛЯ ВЫБОРА АВТОМОБИЛЯ --- */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="car-select-label">{t("order.car")}</InputLabel>
              <Select
                labelId="car-select-label"
                value={editedOrder.car}
                label={t("order.car")}
                name="car"
                onChange={(e) =>
                  setEditedOrder((prev) => ({
                    ...prev,
                    car: e.target.value,
                  }))
                }
              >
                {cars &&
                  [...cars]
                    .sort((a, b) => a.model.localeCompare(b.model)) // сортировка по алфавиту по модели
                    .map((car) => (
                      <MenuItem key={car._id} value={car._id}>
                        {car.model} {car.regNumber}
                      </MenuItem>
                    ))}
              </Select>
            </FormControl>
            {/* --- КОНЕЦ ВЫБОРА АВТОМОБИЛЯ --- */}

            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                onClick={handleConfirmationToggle}
                disabled={isUpdating}
                sx={{
                  width: "100%",
                  backgroundColor: editedOrder?.confirmed
                    ? "text.green"
                    : "text.red",
                }}
              >
                {editedOrder?.confirmed
                  ? t("order.orderConfirmed")
                  : t("order.orderNotConfirmed")}
              </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  label={t("order.pickupDate")}
                  type="date"
                  value={dayjs(editedOrder.rentalStartDate).format(
                    "YYYY-MM-DD"
                  )}
                  onChange={(e) =>
                    setEditedOrder((prev) => ({
                      ...prev,
                      rentalStartDate: dayjs(e.target.value),
                    }))
                  }
                  sx={{ flex: 1 }}
                  size="small"
                />
                <TextField
                  label={t("order.returnDate")}
                  type="date"
                  value={dayjs(editedOrder.rentalEndDate).format("YYYY-MM-DD")}
                  onChange={(e) =>
                    setEditedOrder((prev) => ({
                      ...prev,
                      rentalEndDate: dayjs(e.target.value),
                    }))
                  }
                  sx={{ flex: 1 }}
                  size="small"
                />
              </Box>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  label={t("order.pickupTime")}
                  type="time"
                  value={dayjs(startTime).format("HH:mm")}
                  onChange={(e) => setStartTime(dayjs(e.target.value, "HH:mm"))}
                  sx={{ flex: 1 }}
                  size="small"
                />
                <TextField
                  label={t("order.returnTime")}
                  type="time"
                  value={dayjs(endTime).format("HH:mm")}
                  onChange={(e) => setEndTime(dayjs(e.target.value, "HH:mm"))}
                  sx={{ flex: 1 }}
                  size="small"
                />
              </Box>
              {/* Место получения и возврата в одной строке */}
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <RenderSelectField
                  name="placeIn"
                  label={t("order.pickupLocation")}
                  options={locations}
                  updatedCar={editedOrder}
                  handleChange={handleChangeSelectedBox}
                  required
                  sx={{ flex: "0 1 180px", minWidth: 120, maxWidth: 180 }}
                />
                <RenderSelectField
                  name="placeOut"
                  label={t("order.returnLocation")}
                  updatedCar={editedOrder}
                  options={locations}
                  handleChange={handleChangeSelectedBox}
                  required
                  sx={{ flex: "0 1 180px", minWidth: 120, maxWidth: 180 }}
                />
              </Box>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  label={t("order.insurance")}
                  value={editedOrder.insurance || ""}
                  onChange={(e) =>
                    setEditedOrder((prev) => ({
                      ...prev,
                      insurance: e.target.value,
                    }))
                  }
                  sx={{ width: "50%" }}
                />
                <Box
                  sx={{
                    width: "50%",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  {/* Добавлено поле франшизы заказа */}
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ fontWeight: "bold", mr: 1 }}
                    >
                      {t("car.franchise") || "Франшиза заказа"}:
                    </Typography>
                    <TextField
                      size="small"
                      type="number"
                      value={editedOrder.franchiseOrder || 0}
                      onChange={(e) =>
                        setEditedOrder((prev) => ({
                          ...prev,
                          franchiseOrder: Number(e.target.value),
                        }))
                      }
                      sx={{ width: 120 }}
                    />
                  </Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!editedOrder.ChildSeats}
                        onChange={(e) =>
                          setEditedOrder((prev) => ({
                            ...prev,
                            ChildSeats: e.target.checked,
                          }))
                        }
                        sx={{ mr: 1 }}
                      />
                    }
                    label={
                      <span style={{ color: "#222" }}>
                        {t("order.childSeats")}
                      </span>
                    }
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t("order.clientInfo")}
              </Typography>
              {renderField(t("order.clientName"), "customerName")}
              {renderField(t("order.phone"), "phone")}
              {renderField(t("order.email"), "email")}
              {/* Добавлено поле франшизы заказа
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="body2"
                  component="span"
                  sx={{ fontWeight: "bold", mr: 1 }}
                >
                  {t("order.franchiseOrder") || "Франшиза заказа"}:
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={editedOrder.franchiseOrder || 0}
                  onChange={(e) =>
                    setEditedOrder((prev) => ({
                      ...prev,
                      franchiseOrder: Number(e.target.value),
                    }))
                  }
                  sx={{ width: 120 }}
                />
              </Box> */}
            </Box>

            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Button onClick={onCloseModalEdit} variant="outlined">
                {t("basic.cancel")}
              </Button>
              <Button
                variant="contained"
                color="primary"
                disabled={isUpdating}
                sx={{ mx: 2, width: "40%" }}
                onClick={async () => {
                  setIsUpdating(true);
                  try {
                    // Сохраняем даты
                    await handleDateUpdate();
                    // Сохраняем клиента
                    await handleCustomerUpdate();
                    showMessage(t("order.orderUpdated"));
                  } catch (error) {
                    setUpdateMessage(
                      error?.message || "Ошибка обновления заказа"
                    );
                  } finally {
                    setIsUpdating(false);
                  }
                }}
              >
                {isUpdating ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  t("order.updateOrder")
                )}
              </Button>
              <Button
                variant="contained"
                onClick={handleDelete}
                disabled={isUpdating}
                color="error"
                sx={{ width: "30%" }}
              >
                {isUpdating ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  t("order.deleteOrder")
                )}
              </Button>
            </Box>
          </>
        )}
      </Paper>
      <Snackbar
        open={snackbarOpen}
        message={updateMessage}
        closeFunc={handleSnackbarClose}
        isError={
          updateMessage && updateMessage.toLowerCase().includes("failed")
        }
      />
    </>
  );
};
export default EditOrderModal;
