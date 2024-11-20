import React from "react";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { Chip, Box, Typography } from "@mui/material";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { analyzeDates } from "@utils/analyzeDates";
import dayjs from "dayjs";

const CustomCalendarPicker = ({ orders, setBookedDates }) => {
  const { confirmed, pending } = analyzeDates(orders);

  const isDateUnavailable = (date) => {
    const filteredConfirmed = confirmed.filter((item) => {
      return !item.isStart && !item.isEnd;
    });

    return filteredConfirmed.some(
      (booking) =>
        dayjs(booking.date).format("YYYY-MM-DD") === date.format("YYYY-MM-DD")
    );
  };

  const isDatePending = (date) => {
    return pending.some(
      (booking) =>
        dayjs(booking.date).format("YYYY-MM-DD") === date.format("YYYY-MM-DD")
    );
  };

  const isStartDate = (date) => {
    return (
      confirmed.some(
        (booking) =>
          booking.isStart &&
          dayjs(booking.date).format("YYYY-MM-DD") === date.format("YYYY-MM-DD")
      ) ||
      pending.some(
        (booking) =>
          booking.isStart &&
          dayjs(booking.date).format("YYYY-MM-DD") === date.format("YYYY-MM-DD")
      )
    );
  };

  const isEndDate = (date) => {
    return (
      confirmed.some(
        (booking) =>
          booking.isEnd &&
          dayjs(booking.date).format("YYYY-MM-DD") === date.format("YYYY-MM-DD")
      ) ||
      pending.some(
        (booking) =>
          booking.isEnd &&
          dayjs(booking.date).format("YYYY-MM-DD") === date.format("YYYY-MM-DD")
      )
    );
  };

  const ServerDay = (props) => {
    const { day, outsideCurrentMonth, ...other } = props;

    if (outsideCurrentMonth) {
      return <PickersDay {...other} outsideCurrentMonth day={day} />;
    }

    let customSx = {};
    let disabled = false;
    let tooltipText = "";

    if (isDateUnavailable(day)) {
      customSx = {
        backgroundColor: "#ffebee",
        color: "#d32f2f",
        "&:hover": {
          backgroundColor: "#ffcdd2",
        },
      };
      disabled = true;
      tooltipText = "Недоступно для бронирования";
    } else if (isDatePending(day)) {
      customSx = {
        backgroundColor: "#fff3e0",
        color: "#f57c00",
        "&:hover": {
          backgroundColor: "#ffe0b2",
        },
      };
      tooltipText = "Ожидает подтверждения";
    } else if (isStartDate(day)) {
      customSx = {
        backgroundColor: "#e3f2fd",
        color: "#1976d2",
        "&:hover": {
          backgroundColor: "#bbdefb",
        },
      };
      disabled = true;
      tooltipText = "Начало другого бронирования";
    } else if (isEndDate(day)) {
      customSx = {
        backgroundColor: "#e8f5e9",
        color: "#2e7d32",
        "&:hover": {
          backgroundColor: "#c8e6c9",
        },
      };
      disabled = true;
      tooltipText = "Окончание другого бронирования";
    }

    return (
      <PickersDay
        {...other}
        day={day}
        sx={customSx}
        disabled={disabled}
        title={tooltipText}
      />
    );
  };

  const [value, setValue] = React.useState(null);

  // Обработчик изменения дат
  const handleDateChange = (newValue) => {
    setValue(newValue);

    if (newValue && newValue[0] && newValue[1]) {
      setBookedDates({
        start: newValue[0],
        end: newValue[1],
      });
    }
  };
  return (
    <Box sx={{ maxWidth: 400, p: 2 }}>
      <DateRangePicker
        value={value}
        localeText={{ start: "Start", end: "End" }}
        onChange={handleDateChange}
        slots={{
          day: ServerDay,
        }}
        disablePast // Отключаем выбор прошедших дат
      />
    </Box>
  );
};

export default CustomCalendarPicker;
