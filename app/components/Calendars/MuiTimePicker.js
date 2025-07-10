// import * as React from "react";
// import dayjs from "dayjs";
// import { Box, TextField, Typography } from "@mui/material";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { TimePicker } from "@mui/x-date-pickers/TimePicker";
// import { useTranslation } from "react-i18next";

// export default function Time({
//   startTime,
//   endTime,
//   setStartTime,
//   setEndTime,
//   isRestrictionTimeIn = false,
//   isRestrictionTimeOut = false,
//   mb = 0,
//   timeInMessage = null,
//   timeOutMessage = null,
// }) {
//   const { t } = useTranslation();
//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <Box sx={{ mt: 2 }}>
//         <TimePicker
//           label={t("order.pickupTime")}
//           value={startTime}
//           minTime={isRestrictionTimeIn ? startTime : null}
//           format="HH:mm"
//           onChange={(newValue) => setStartTime(newValue)}
//           // slots={{
//           //   textField: (params) => <TextField {...params} fullWidth />,
//           // }}
//         />
//         {isRestrictionTimeIn && (
//           <Typography sx={{ color: "primary.main", fontSize: 13 }}>
//             {" "}
//             The car is not availbale before {isRestrictionTimeIn}{" "}
//           </Typography>
//         )}

//         {timeInMessage && (
//           <Typography sx={{ color: "primary.main", fontSize: 13 }}>
//             {" "}
//             {timeInMessage}
//           </Typography>
//         )}
//       </Box>
//       <Box sx={{ mt: 2, mb: mb }}>
//         <TimePicker
//           label={t("order.returnTime")}
//           value={endTime}
//           maxTime={isRestrictionTimeOut ? endTime : null}
//           onChange={(newValue) => setEndTime(newValue)}
//           format="HH:mm"
//           // slots={{
//           //   textField: (params) => <TextField {...params} fullWidth />,
//           // }}
//         />
//         {isRestrictionTimeOut && (
//           <Typography sx={{ color: "primary.main", fontSize: 13 }}>
//             {" "}
//             The car is not availbale after {isRestrictionTimeOut}{" "}
//           </Typography>
//         )}
//         {timeOutMessage && (
//           <Typography sx={{ color: "primary.main", fontSize: 13 }}>
//             {" "}
//             {timeOutMessage}
//           </Typography>
//         )}
//       </Box>
//     </LocalizationProvider>
//   );
// }
import * as React from "react";
import dayjs from "dayjs";
import { Box, TextField, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { useTranslation } from "react-i18next";

export default function Time({
  startTime,
  endTime,
  setStartTime,
  setEndTime,
  selectedDate,
  carId,
  existingBookings = [], // массив существующих бронирований
  currentBookingId = null, // ID текущего бронирования (при редактировании)
  isRestrictionTimeIn = false,
  isRestrictionTimeOut = false,
  mb = 0,
  timeInMessage = null,
  timeOutMessage = null,
}) {
  const { t } = useTranslation();

  // Получаем отфильтрованные заказы для этого автомобиля в эту дату
  const getFilteredBookings = () => {
    if (!selectedDate || !carId) return [];

    return existingBookings.filter((booking) => {
      // Исключаем текущий заказ при редактировании
      if (currentBookingId && booking.id === currentBookingId) {
        return false;
      }

      return (
        booking.carId === carId &&
        dayjs(booking.date).isSame(selectedDate, "day")
      );
    });
  };

  // Функция для поиска предыдущего заказа (который заканчивается раньше нового)
  const getPreviousOrderEndTime = (newStartTime) => {
    if (!newStartTime) return null;

    const filteredBookings = getFilteredBookings();
    const newStart = dayjs(newStartTime);

    // Находим заказы, которые заканчиваются до начала нового заказа
    const previousOrders = filteredBookings.filter((booking) => {
      const bookingEnd = dayjs(booking.returnTime);
      return bookingEnd.isBefore(newStart) || bookingEnd.isSame(newStart);
    });

    if (previousOrders.length === 0) return null;

    // Берем последний из предыдущих заказов (с максимальным временем окончания)
    const lastPreviousOrder = previousOrders.reduce((latest, current) => {
      return dayjs(current.returnTime).isAfter(dayjs(latest.returnTime))
        ? current
        : latest;
    });

    return dayjs(lastPreviousOrder.returnTime);
  };

  // Функция для поиска следующего заказа (который начинается после нового)
  const getNextOrderStartTime = (newEndTime) => {
    if (!newEndTime) return null;

    const filteredBookings = getFilteredBookings();
    const newEnd = dayjs(newEndTime);

    // Находим заказы, которые начинаются после окончания нового заказа
    const nextOrders = filteredBookings.filter((booking) => {
      const bookingStart = dayjs(booking.startTime);
      return bookingStart.isAfter(newEnd) || bookingStart.isSame(newEnd);
    });

    if (nextOrders.length === 0) return null;

    // Берем первый из следующих заказов (с минимальным временем начала)
    const firstNextOrder = nextOrders.reduce((earliest, current) => {
      return dayjs(current.startTime).isBefore(dayjs(earliest.startTime))
        ? current
        : earliest;
    });

    return dayjs(firstNextOrder.startTime);
  };

  // Проверка правила 1: время получения >= время возврата предыдущего заказа
  const validateStartTime = () => {
    if (!startTime) return { isValid: true, message: null };

    const previousOrderEndTime = getPreviousOrderEndTime(startTime);
    if (!previousOrderEndTime) return { isValid: true, message: null };

    const newStartTime = dayjs(startTime);

    if (newStartTime.isBefore(previousOrderEndTime)) {
      return {
        isValid: false,
        message: `Время получения не может быть раньше ${previousOrderEndTime.format(
          "HH:mm"
        )} (время возврата предыдущего заказа)`,
      };
    }

    return { isValid: true, message: null };
  };

  // Проверка правила 2: время возврата <= время получения следующего заказа
  const validateEndTime = () => {
    if (!endTime) return { isValid: true, message: null };

    const nextOrderStartTime = getNextOrderStartTime(endTime);
    if (!nextOrderStartTime) return { isValid: true, message: null };

    const newEndTime = dayjs(endTime);

    if (newEndTime.isAfter(nextOrderStartTime)) {
      return {
        isValid: false,
        message: `Время возврата не может быть позже ${nextOrderStartTime.format(
          "HH:mm"
        )} (время получения следующего заказа)`,
      };
    }

    return { isValid: true, message: null };
  };

  // Получаем ограничения времени для TimePicker
  const getTimeConstraints = () => {
    const filteredBookings = getFilteredBookings();

    if (filteredBookings.length === 0) {
      return {
        minStartTime: isRestrictionTimeIn ? dayjs(isRestrictionTimeIn) : null,
        maxEndTime: isRestrictionTimeOut ? dayjs(isRestrictionTimeOut) : null,
      };
    }

    // Находим минимальное время начала (после последнего предыдущего заказа)
    let minStartTime = null;
    if (startTime) {
      const previousEndTime = getPreviousOrderEndTime(startTime);
      if (previousEndTime) {
        minStartTime = previousEndTime;
      }
    }

    // Учитываем системные ограничения
    if (isRestrictionTimeIn) {
      const restrictionTime = dayjs(isRestrictionTimeIn);
      minStartTime =
        minStartTime && minStartTime.isAfter(restrictionTime)
          ? minStartTime
          : restrictionTime;
    }

    // Находим максимальное время окончания (до первого следующего заказа)
    let maxEndTime = null;
    if (endTime) {
      const nextStartTime = getNextOrderStartTime(endTime);
      if (nextStartTime) {
        maxEndTime = nextStartTime;
      }
    }

    // Учитываем системные ограничения
    if (isRestrictionTimeOut) {
      const restrictionTime = dayjs(isRestrictionTimeOut);
      maxEndTime =
        maxEndTime && maxEndTime.isBefore(restrictionTime)
          ? maxEndTime
          : restrictionTime;
    }

    return { minStartTime, maxEndTime };
  };

  const startTimeValidation = validateStartTime();
  const endTimeValidation = validateEndTime();
  const { minStartTime, maxEndTime } = getTimeConstraints();

  const handleStartTimeChange = (newValue) => {
    setStartTime(newValue);

    // Автоматически корректируем время окончания если нужно
    if (endTime && newValue && dayjs(newValue).isAfter(endTime)) {
      setEndTime(dayjs(newValue).add(1, "hour"));
    }
  };

  const handleEndTimeChange = (newValue) => {
    setEndTime(newValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mt: 2 }}>
        <TimePicker
          label={t("order.pickupTime")}
          value={startTime}
          minTime={minStartTime}
          format="HH:mm"
          onChange={handleStartTimeChange}
          slotProps={{
            textField: {
              error: !startTimeValidation.isValid,
              helperText: startTimeValidation.message,
            },
          }}
        />

        {isRestrictionTimeIn && (
          <Typography sx={{ color: "primary.main", fontSize: 13 }}>
            Автомобиль недоступен до {isRestrictionTimeIn}
          </Typography>
        )}

        {/* {minStartTime && (
          <Typography sx={{ color: "info.main", fontSize: 13 }}>
            Минимальное время получения: {minStartTime.format("HH:mm")}
          </Typography>
        )} */}

        {timeInMessage && (
          <Typography sx={{ color: "primary.main", fontSize: 13 }}>
            {timeInMessage}
          </Typography>
        )}
      </Box>

      <Box sx={{ mt: 2, mb: mb }}>
        <TimePicker
          label={t("order.returnTime")}
          value={endTime}
          minTime={startTime ? dayjs(startTime).add(30, "minute") : null}
          maxTime={maxEndTime}
          onChange={handleEndTimeChange}
          format="HH:mm"
          slotProps={{
            textField: {
              error: !endTimeValidation.isValid,
              helperText: endTimeValidation.message,
            },
          }}
        />

        {isRestrictionTimeOut && (
          <Typography sx={{ color: "primary.main", fontSize: 13 }}>
            Автомобиль недоступен после {isRestrictionTimeOut}
          </Typography>
        )}

        {/* {maxEndTime && (
          <Typography sx={{ color: "info.main", fontSize: 13 }}>
            Максимальное время возврата: {maxEndTime.format("HH:mm")}
          </Typography>
        )} */}

        {timeOutMessage && (
          <Typography sx={{ color: "primary.main", fontSize: 13 }}>
            {timeOutMessage}
          </Typography>
        )}
      </Box>
    </LocalizationProvider>
  );
}
