// Хук для получения количества дней и стоимости аренды через API (как в AddOrderModal)
function useDaysAndTotal(
  car,
  rentalStartDate,
  rentalEndDate,
  insurance,
  childSeats
) {
  const [daysAndTotal, setDaysAndTotal] = React.useState({
    days: 0,
    totalPrice: 0,
  });
  const [calcLoading, setCalcLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchTotalPrice = async () => {
      if (!car?.carNumber || !rentalStartDate || !rentalEndDate) {
        setDaysAndTotal({ days: 0, totalPrice: 0 });
        return;
      }
      setCalcLoading(true);
      try {
        const res = await fetch("/api/order/calcTotalPrice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            carNumber: car.carNumber,
            rentalStartDate,
            rentalEndDate,
            kacko: insurance,
            childSeats: childSeats,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setDaysAndTotal({ days: data.days, totalPrice: data.totalPrice });
        } else {
          setDaysAndTotal({ days: 0, totalPrice: 0 });
        }
      } catch {
        setDaysAndTotal({ days: 0, totalPrice: 0 });
      } finally {
        setCalcLoading(false);
      }
    };
    fetchTotalPrice();
  }, [car?.carNumber, rentalStartDate, rentalEndDate, insurance, childSeats]);

  return { daysAndTotal, calcLoading };
}
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
  Autocomplete,
} from "@mui/material";
import { RenderTextField } from "@app/components/common/Fields";
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
  const [editedOrder, setEditedOrder] = useState({
    ...order,
  });
  // Флаг: первое открытие модального окна (не запускать автосинхронизацию totalPrice)
  const isFirstOpen = React.useRef(true);
  // Флаг: редактирует ли админ вручную поле totalPrice
  const [isManualTotalPrice, setIsManualTotalPrice] = useState(false);
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
        timeIn: dayjs.utc(order.timeIn),
        timeOut: dayjs.utc(order.timeOut),
      };
      setEditedOrder(adjustedOrder);
      setIsManualTotalPrice(false); // Сброс ручного режима при открытии
      setStartTime(dayjs.utc(order.timeIn));
      setEndTime(dayjs.utc(order.timeOut));
      isFirstOpen.current = true; // Сбросить флаг при каждом открытии
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

  // --- Серверный расчет количества дней и стоимости ---
  const selectedCar = React.useMemo(() => {
    return cars?.find((c) => c._id === editedOrder.car) || null;
  }, [cars, editedOrder.car]);

  const { daysAndTotal, calcLoading } = useDaysAndTotal(
    selectedCar,
    editedOrder.rentalStartDate
      ? dayjs(editedOrder.rentalStartDate).format("YYYY-MM-DD")
      : null,
    editedOrder.rentalEndDate
      ? dayjs(editedOrder.rentalEndDate).format("YYYY-MM-DD")
      : null,
    editedOrder.insurance,
    editedOrder.ChildSeats
  );

  // Синхронизация numberOfDays и totalPrice с сервером (если не ручной режим)
  useEffect(() => {
    // На первом открытии не трогаем ни numberOfDays, ни totalPrice
    if (isFirstOpen.current) return;
    if (!isManualTotalPrice) {
      // daysAndTotal может случайно стать объектом вида { totalPrice, days }
      const safeTotalPrice =
        typeof daysAndTotal.totalPrice === "number"
          ? daysAndTotal.totalPrice
          : typeof daysAndTotal.totalPrice === "object" &&
            daysAndTotal.totalPrice !== null &&
            typeof daysAndTotal.totalPrice.totalPrice === "number"
          ? daysAndTotal.totalPrice.totalPrice
          : 0;
      const safeDays =
        typeof daysAndTotal.days === "number"
          ? daysAndTotal.days
          : typeof daysAndTotal.days === "object" &&
            daysAndTotal.days !== null &&
            typeof daysAndTotal.days.days === "number"
          ? daysAndTotal.days.days
          : 0;
      if (
        safeDays !== editedOrder.numberOfDays ||
        safeTotalPrice !== editedOrder.totalPrice
      ) {
        setEditedOrder((prev) => ({
          ...prev,
          numberOfDays: safeDays,
          totalPrice: safeTotalPrice,
        }));
      }
    } else {
      // Если ручной режим, только количество дней обновляем
      const safeDays =
        typeof daysAndTotal.days === "number"
          ? daysAndTotal.days
          : typeof daysAndTotal.days === "object" &&
            daysAndTotal.days !== null &&
            typeof daysAndTotal.days.days === "number"
          ? daysAndTotal.days.days
          : 0;
      if (safeDays !== editedOrder.numberOfDays) {
        setEditedOrder((prev) => ({
          ...prev,
          numberOfDays: safeDays,
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daysAndTotal.days, daysAndTotal.totalPrice]);

  // Сброс ручного режима и isFirstOpen только при реальном изменении ключевых полей
  useEffect(() => {
    if (!order) return;
    // Проверяем, изменились ли ключевые поля по сравнению с order из базы
    const isCarChanged = editedOrder.car !== order.car;
    const isStartChanged =
      dayjs(editedOrder.rentalStartDate).format("YYYY-MM-DD") !==
      dayjs(order.rentalStartDate).format("YYYY-MM-DD");
    const isEndChanged =
      dayjs(editedOrder.rentalEndDate).format("YYYY-MM-DD") !==
      dayjs(order.rentalEndDate).format("YYYY-MM-DD");
    const isInsuranceChanged = editedOrder.insurance !== order.insurance;
    const isChildSeatsChanged = editedOrder.ChildSeats !== order.ChildSeats;
    if (
      isCarChanged ||
      isStartChanged ||
      isEndChanged ||
      isInsuranceChanged ||
      isChildSeatsChanged
    ) {
      setIsManualTotalPrice(false);
      isFirstOpen.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    editedOrder.car,
    editedOrder.rentalStartDate,
    editedOrder.rentalEndDate,
    editedOrder.insurance,
    editedOrder.ChildSeats,
    order,
  ]);

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
        // Отправляем даты в UTC, чтобы окружение (локально/хостинг) трактовало их одинаково
        rentalStartDate: dayjs
          .utc(editedOrder.rentalStartDate.format("YYYY-MM-DD"))
          .toDate(),
        rentalEndDate: dayjs
          .utc(editedOrder.rentalEndDate.format("YYYY-MM-DD"))
          .toDate(),
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
        ChildSeats: editedOrder.ChildSeats,
        insurance: editedOrder.insurance,
        franchiseOrder: editedOrder.franchiseOrder,
        totalPrice: editedOrder.totalPrice, // <-- сохраняем totalPrice
      };

      // Debug: логируем даты, которые пойдут в проверку конфликтов
      try {
        // Используем groupCollapsed, чтобы не засорять консоль
        console.groupCollapsed(
          "EditOrderModal ▶ conflict-check payload (before save)"
        );
        console.log("Order ID:", editedOrder?._id);
        console.log(
          "Car ID:",
          datesToSend.car,
          "CarNumber:",
          datesToSend.carNumber
        );
        console.log(
          "PlaceIn/Out:",
          datesToSend.placeIn,
          "/",
          datesToSend.placeOut
        );
        const d = (x) => (x ? dayjs(x) : null);
        const fmt = (dj) =>
          dj
            ? {
                local: dj.format("YYYY-MM-DD HH:mm"),
                iso: dj.toISOString(),
              }
            : null;
        console.log("rentalStartDate:", fmt(d(datesToSend.rentalStartDate)));
        console.log("rentalEndDate:", fmt(d(datesToSend.rentalEndDate)));
        console.log(
          "timeIn (UTC composed):",
          fmt(
            dayjs.utc(
              dayjs(editedOrder.rentalStartDate).format("YYYY-MM-DD") +
                " " +
                dayjs(startTime).format("HH:mm")
            )
          )
        );
        console.log(
          "timeOut (UTC composed):",
          fmt(
            dayjs.utc(
              dayjs(editedOrder.rentalEndDate).format("YYYY-MM-DD") +
                " " +
                dayjs(endTime).format("HH:mm")
            )
          )
        );
        console.groupEnd();
      } catch (e) {
        // no-op — логирование не должно ломать сохранение
      }

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
        datesToSend.franchiseOrder,
        editedOrder.numberOrder,
        editedOrder.insuranceOrder,
        Number(editedOrder.totalPrice),
        Number(editedOrder.numberOfDays)
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
        totalPrice: editedOrder.totalPrice, // <-- сохраняем totalPrice
        flightNumber: editedOrder.flightNumber || "",
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
          pt: { xs: 1, md: 2 },
          maxHeight: "99vh",
          overflow: "auto",
          border: isConflictOrder ? "4px solid #FF0000" : "none",
          animation: isConflictOrder ? "pulse 2s infinite" : "none",
          // Центрирование убрано, Paper теперь не центрируется явно
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography
              variant="h6"
              color="primary.main"
              sx={{ letterSpacing: "-0.5px", fontSize: "1.3rem" }}
            >
              {t("order.editOrder")} №
              {order?.orderNumber ? order.orderNumber.slice(2, -2) : ""}
              {(() => {
                // Найти автомобиль по id заказа
                const carObj = cars?.find(
                  (c) => c._id === (order?.car || editedOrder?.car)
                );
                if (carObj) {
                  return ` (${carObj.model} ${carObj.regNumber})`;
                }
                return "";
              })()}
            </Typography>
            {/* Новая строка: Количество дней и стоимость */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="left"
              sx={{ mb: 1 }}
            >
              <Typography variant="body1">
                {t("order.daysNumber")}{" "}
                <span style={{ color: "red", fontWeight: 700 }}>
                  {editedOrder?.numberOfDays}
                </span>{" "}
                | {t("order.price")}
              </Typography>
              <TextField
                value={
                  editedOrder.totalPrice !== undefined &&
                  editedOrder.totalPrice !== null
                    ? editedOrder.totalPrice
                    : ""
                }
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setEditedOrder((prev) => ({
                    ...prev,
                    totalPrice: val ? Number(val) : 0,
                  }));
                  setIsManualTotalPrice(true); // Включаем ручной режим при ручном вводе
                }}
                variant="outlined"
                size="small"
                inputProps={{
                  style: {
                    fontWeight: 700,
                    fontSize: 18,
                    textAlign: "right",
                    letterSpacing: 1,
                    width: "5ch",
                    paddingRight: 0,
                    color: "red",
                  },
                  maxLength: 4,
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
                InputProps={{
                  endAdornment: (
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 18,
                        marginLeft: 0,
                        marginRight: "-8px",
                        paddingLeft: 0,
                        paddingRight: 0,
                        letterSpacing: 0,
                        color: "red",
                        display: "inline-block",
                      }}
                    >
                      €
                    </span>
                  ),
                }}
                sx={{
                  ml: 1,
                  mt: 0,
                  mb: 0,
                  width: "90px",
                  "& .MuiInputBase-input": {
                    padding: "8px 8px 8px 12px",
                    width: "5ch",
                    boxSizing: "content-box",
                    color: "red",
                    fontSize: 18,
                  },
                }}
              />
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

            <Divider
              sx={{
                my: 1.5,
                borderColor: editedOrder?.my_order ? "#4caf50" : "#f44336",
                borderWidth: 2,
              }}
            />

            {/* --- ВЫПАДАЮЩИЙ СПИСОК ДЛЯ ВЫБОРА АВТОМОБИЛЯ --- */}
            {/* <FormControl fullWidth sx={{ mb: 1, minHeight: 36 }} size="small">
              <InputLabel id="car-select-label">{t("order.car")}</InputLabel>
              <Select
                labelId="car-select-label"
                value={editedOrder.car}
                label={t("order.car")}
                name="car"
                size="small"
                onChange={(e) =>
                  setEditedOrder((prev) => ({
                    ...prev,
                    car: e.target.value,
                  }))
                }
                sx={{ minHeight: 36 }}
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
            </FormControl> */}
            {/* --- КОНЕЦ ВЫБОРА АВТОМОБИЛЯ --- */}

            <Box sx={{ mb: 2 }}>
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

            <Box sx={{ mb: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mb: 1,
                  alignItems: "flex-start",
                }}
              >
                <TextField
                  label={t("order.pickupDate")}
                  type="date"
                  value={dayjs(editedOrder.rentalStartDate).format(
                    "YYYY-MM-DD"
                  )}
                  onChange={(e) => {
                    const defaultStartHour = companyData.defaultStart.slice(
                      0,
                      2
                    );
                    const defaultStartMinute =
                      companyData.defaultStart.slice(-2);
                    let newStart = dayjs(e.target.value);
                    // Устанавливаем дефолтное время получения (например, 17:00)
                    newStart = newStart
                      .hour(Number(defaultStartHour))
                      .minute(Number(defaultStartMinute));
                    setEditedOrder((prev) => {
                      const currentReturn = dayjs(prev.rentalEndDate);
                      // Если новая дата получения делает дату возврата некорректной — не менять дату получения
                      if (
                        currentReturn.isValid() &&
                        newStart.isValid() &&
                        !currentReturn.isAfter(newStart, "day")
                      ) {
                        return prev;
                      }
                      return {
                        ...prev,
                        rentalStartDate: newStart,
                      };
                    });
                  }}
                  sx={{ flex: 1, minHeight: 48 }}
                  size="medium"
                  InputProps={{ style: { minHeight: 48 } }}
                />
                <TextField
                  label={t("order.returnDate")}
                  type="date"
                  value={
                    editedOrder.rentalEndDate
                      ? dayjs(editedOrder.rentalEndDate).format("YYYY-MM-DD")
                      : ""
                  }
                  onChange={(e) => {
                    const defaultEndHour = companyData.defaultEnd.slice(0, 2);
                    const defaultEndMinute = companyData.defaultEnd.slice(-2);
                    let newReturn = dayjs(e.target.value);
                    // Устанавливаем дефолтное время возврата (например, 12:00)
                    newReturn = newReturn
                      .hour(Number(defaultEndHour))
                      .minute(Number(defaultEndMinute));
                    const minReturn = dayjs(editedOrder.rentalStartDate).add(
                      1,
                      "day"
                    );
                    // Только если новая дата возврата больше даты получения минимум на 1 день
                    if (
                      newReturn.isValid() &&
                      newReturn.isAfter(minReturn.subtract(1, "day"), "day")
                    ) {
                      setEditedOrder((prev) => ({
                        ...prev,
                        rentalEndDate: newReturn,
                      }));
                    }
                  }}
                  sx={{ flex: 1, minHeight: 48 }}
                  size="medium"
                  InputProps={{ style: { minHeight: 48 } }}
                  inputProps={{
                    min: dayjs(editedOrder.rentalStartDate)
                      .add(1, "day")
                      .format("YYYY-MM-DD"),
                  }}
                />
              </Box>
              <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
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
              {/* Место получения и возврата: Autocomplete с freeSolo */}
              <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                <Autocomplete
                  freeSolo
                  options={locations}
                  value={editedOrder.placeIn || ""}
                  onChange={(_, newValue) =>
                    setEditedOrder((prev) => ({
                      ...prev,
                      placeIn: newValue || "",
                    }))
                  }
                  onInputChange={(_, newInputValue) =>
                    setEditedOrder((prev) => ({
                      ...prev,
                      placeIn: newInputValue,
                    }))
                  }
                  PaperProps={{
                    sx: {
                      border: "2px solid black !important",
                      borderRadius: 1,
                      boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                      backgroundColor: "background.paper",
                    },
                  }}
                  PopperProps={{ style: { zIndex: 1400 } }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("order.pickupLocation")}
                      size="medium"
                      required
                      InputProps={{
                        ...params.InputProps,
                        style: { minHeight: 48 },
                      }}
                    />
                  )}
                  sx={{
                    flex: 1,
                    minHeight: 48,
                  }}
                />
                {editedOrder.placeIn &&
                  editedOrder.placeIn.toLowerCase() === "airport" && (
                    <TextField
                      label={t("order.flightNumber") || "Номер рейса"}
                      value={editedOrder.flightNumber || ""}
                      onChange={(e) =>
                        setEditedOrder((prev) => ({
                          ...prev,
                          flightNumber: e.target.value,
                        }))
                      }
                      size="medium"
                      sx={{ width: "25%", alignSelf: "stretch" }}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                <Autocomplete
                  freeSolo
                  options={locations}
                  value={editedOrder.placeOut || ""}
                  onChange={(_, newValue) =>
                    setEditedOrder((prev) => ({
                      ...prev,
                      placeOut: newValue || "",
                    }))
                  }
                  onInputChange={(_, newInputValue) =>
                    setEditedOrder((prev) => ({
                      ...prev,
                      placeOut: newInputValue,
                    }))
                  }
                  PaperProps={{
                    sx: {
                      border: "2px solid black !important",
                      borderRadius: 1,
                      boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                      backgroundColor: "background.paper",
                    },
                  }}
                  PopperProps={{ style: { zIndex: 1400 } }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("order.returnLocation")}
                      size="medium"
                      required
                      InputProps={{
                        ...params.InputProps,
                        style: { minHeight: 48 },
                      }}
                    />
                  )}
                  sx={{
                    flex: 1,
                    minHeight: 48,
                  }}
                />
              </Box>
              <Box sx={{ display: "flex", gap: 2, mb: 0 }}>
                <FormControl
                  fullWidth
                  sx={{
                    width: editedOrder.insurance === "TPL" ? "49%" : "30%",
                  }}
                >
                  <InputLabel>{t("order.insurance")}</InputLabel>
                  <Select
                    label={t("order.insurance")}
                    value={editedOrder.insurance || ""}
                    onChange={(e) =>
                      setEditedOrder((prev) => ({
                        ...prev,
                        insurance: e.target.value,
                      }))
                    }
                  >
                    {(
                      t("order.insuranceOptions", { returnObjects: true }) || []
                    ).map((option) => {
                      let kaskoPrice = 0;
                      const selectedCar = cars?.find(
                        (c) => c._id === editedOrder.car
                      );
                      if (
                        option.value === "CDW" &&
                        selectedCar &&
                        selectedCar.PriceKacko
                      ) {
                        kaskoPrice = selectedCar.PriceKacko;
                      }
                      return (
                        <MenuItem key={option.value} value={option.value}>
                          {option.value === "CDW"
                            ? `${option.label} ${kaskoPrice}€/${t(
                                "order.perDay"
                              )}`
                            : option.label}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
                {editedOrder.insurance === "CDW" && (
                  <Box sx={{ width: "16%" }}>
                    <RenderTextField
                      name="franchiseOrder"
                      label={t("car.franchise") || "Франшиза заказа"}
                      type="number"
                      updatedCar={editedOrder}
                      handleChange={(e) =>
                        setEditedOrder((prev) => ({
                          ...prev,
                          franchiseOrder: Number(e.target.value),
                        }))
                      }
                      isLoading={loading}
                    />
                  </Box>
                )}
                <FormControl fullWidth sx={{ width: "49%" }}>
                  <InputLabel>
                    {t("order.childSeats")}{" "}
                    {(() => {
                      const selectedCar = cars?.find(
                        (c) => c._id === editedOrder.car
                      );
                      return selectedCar && selectedCar.PriceChildSeats
                        ? selectedCar.PriceChildSeats
                        : 0;
                    })()}
                    €/{t("order.perDay")}
                  </InputLabel>
                  <Select
                    label={`${t("order.childSeats")} ${(() => {
                      const selectedCar = cars?.find(
                        (c) => c._id === editedOrder.car
                      );
                      return selectedCar && selectedCar.PriceChildSeats
                        ? selectedCar.PriceChildSeats
                        : 0;
                    })()}€/${t("order.perDay")}`}
                    value={
                      typeof editedOrder.ChildSeats === "number"
                        ? editedOrder.ChildSeats
                        : 0
                    }
                    onChange={(e) =>
                      setEditedOrder((prev) => ({
                        ...prev,
                        ChildSeats: Number(e.target.value),
                      }))
                    }
                  >
                    <MenuItem value={0}>{t("order.childSeatsNone")}</MenuItem>
                    {[1, 2, 3, 4].map((num) => (
                      <MenuItem key={num} value={num}>
                        {num}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* <Divider
              sx={{
                my: 2,
                borderColor: editedOrder?.my_order ? "#4caf50" : "#f44336",
                borderWidth: 2,
              }}
            /> */}

            {/* Блок данных клиента: имя на отдельной строке, телефон и email — ниже в одну строку */}
            <Box sx={{ mb: 0 }}>
              <FormControl fullWidth margin="dense" sx={{ mt: 0, mb: 0 }}>
                <TextField
                  fullWidth
                  margin="dense"
                  label={
                    <>
                      <span>{t("order.clientName")}</span>
                      <span style={{ color: "red" }}>*</span>
                    </>
                  }
                  value={editedOrder.customerName || ""}
                  onChange={(e) =>
                    setEditedOrder((prev) => ({
                      ...prev,
                      customerName: e.target.value,
                    }))
                  }
                />
              </FormControl>
              <Box sx={{ display: "flex", gap: 2, mb: 0 }}>
                <FormControl
                  fullWidth
                  margin="dense"
                  sx={{ flex: 1, minHeight: 36 }}
                >
                  <TextField
                    fullWidth
                    margin="dense"
                    size="small"
                    label={
                      <>
                        <span>{t("order.phone")}</span>
                        <span style={{ color: "red" }}>*</span>
                      </>
                    }
                    value={editedOrder.phone || ""}
                    onChange={(e) =>
                      setEditedOrder((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </FormControl>
                <FormControl
                  fullWidth
                  margin="dense"
                  sx={{ flex: 1, minHeight: 36 }}
                >
                  <TextField
                    fullWidth
                    margin="dense"
                    size="small"
                    label={
                      <>
                        {t("order.email")}
                        <span
                          style={{
                            color: "green",
                            fontWeight: 500,
                            marginLeft: 8,
                          }}
                        >
                          {t("basic.optional")}
                        </span>
                      </>
                    }
                    value={editedOrder.email || ""}
                    onChange={(e) =>
                      setEditedOrder((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </FormControl>
              </Box>
            </Box>

            <Box
              sx={{
                mt: 1,
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
