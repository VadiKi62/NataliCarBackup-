import React, { useState, useMemo } from "react";
import { Calendar, Typography } from "antd";
import dayjs from "dayjs";
import { Box } from "@mui/material";

const CalendarPicker = ({ car, setBookedDates, onBookingComplete, orders }) => {
  const [selectedRange, setSelectedRange] = useState([null, null]);

  const { unavailableDates, confirmedDates } = useMemo(() => {
    const unavailable = [];
    const confirmed = [];

    orders.forEach((order) => {
      const startDate = dayjs(order.rentalStartDate);
      const endDate = dayjs(order.rentalEndDate);

      let currentDate = startDate;
      while (
        currentDate.isBefore(endDate) ||
        currentDate.isSame(endDate, "day")
      ) {
        const dateStr = currentDate.format("YYYY-MM-DD");
        unavailable.push(dateStr);
        if (order.confirmed) {
          confirmed.push(dateStr);
        }
        currentDate = currentDate.add(1, "day");
      }
    });

    return { unavailableDates: unavailable, confirmedDates: confirmed };
  }, [orders]);

  const disabledDate = (current) => {
    return (
      current &&
      (current.isBefore(dayjs().startOf("day")) ||
        unavailableDates.includes(current.format("YYYY-MM-DD")))
    );
  };

  const onSelect = (date) => {
    const [start, end] = selectedRange;

    if (!start || (start && end)) {
      setSelectedRange([date, null]);
    } else {
      const range = [start, date].sort((a, b) => a - b);
      setSelectedRange(range);
      setBookedDates({ start: range[0], end: range[1] });
      onBookingComplete();
    }
  };

  const renderDateCell = (date) => {
    const [start, end] = selectedRange;
    const dateStr = date.format("YYYY-MM-DD");
    const isSelected =
      (date >= start && date <= end) ||
      date.isSame(start, "day") ||
      date.isSame(end, "day");
    const isConfirmed = confirmedDates.includes(dateStr);
    const isUnavailable = unavailableDates.includes(dateStr);

    let backgroundColor = "transparent";
    let color = "inherit";

    if (isSelected) {
      backgroundColor = "primary.dark";
      color = "warning.main";
    } else if (isConfirmed) {
      backgroundColor = "error.light"; // Red for confirmed
      color = "common.white";
    } else if (isUnavailable) {
      backgroundColor = "yellow"; // Yellow for unconfirmed
      color = "common.black";
    }

    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor,
          borderRadius: "5px",
          color,
        }}
      >
        {date.date()}
      </Box>
    );
  };

  return (
    <div style={{ maxWidth: "100%", padding: "20px" }}>
      <Typography sx={{ marginBottom: "20px", color: "primary.main" }}>
        Choose your dates for booking
      </Typography>
      <Box sx={{ marginBottom: "10px" }}>
        <Box
          component="span"
          sx={{
            display: "inline-block",
            width: "20px",
            height: "20px",
            backgroundColor: "error.light",
            marginRight: "10px",
          }}
        ></Box>
        <Typography component="span">Confirmed bookings</Typography>
      </Box>
      <Box sx={{ marginBottom: "10px" }}>
        <Box
          component="span"
          sx={{
            display: "inline-block",
            width: "20px",
            height: "20px",
            backgroundColor: "yellow",
            marginRight: "10px",
          }}
        ></Box>
        <Typography component="span">Unconfirmed bookings</Typography>
      </Box>
      <Calendar
        fullscreen={false}
        onSelect={onSelect}
        disabledDate={disabledDate}
        fullCellRender={renderDateCell}
      />
    </div>
  );
};

export default CalendarPicker;
