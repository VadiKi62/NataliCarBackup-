import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import { Calendar } from "antd";
import dayjs from "dayjs";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DefaultButton from "../common/DefaultButton";
import {
  functionToretunrStartEndOverlap,
  getConfirmedAndUnavailableStartEndDates,
} from "@utils/functions";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone
dayjs.tz.setDefault("Europe/Athens");

const CalendarPicker = ({
  isLoading,
  setBookedDates,
  onBookingComplete,
  orders,
  carId,
}) => {
  const [selectedRange, setSelectedRange] = useState([null, null]);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [confirmedDates, setConfirmedDates] = useState([]);
  const [startEndDates, setStartEndDates] = useState([]);
  const [showBookButton, setShowBookButton] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState({
    start: null,
    end: null,
  });
  const [startEndOverlapDates, setStartEndOverlapDates] = useState(null);
  const [overlapDates, setOverlapDates] = useState(null);

  console.log("carId", carId);
  console.log("orders", orders);

  useEffect(() => {
    const unavailable = [];
    const confirmed = [];
    const startEnd = [];

    orders.forEach((order) => {
      const startDate = dayjs(order.rentalStartDate);
      const endDate = dayjs(order.rentalEndDate);

      // Add start and end dates to special handling array
      startEnd.push({
        date: startDate.format("YYYY-MM-DD"),
        type: "start",
        time: dayjs(order.timeIn).format("HH:mm"),
        confirmed: order.confirmed,
      });
      startEnd.push({
        date: endDate.format("YYYY-MM-DD"),
        type: "end",
        time: dayjs(order.timeOut).format("HH:mm"),
        confirmed: order.confirmed,
      });

      // Handle middle dates
      let currentDate = startDate.add(1, "day");
      while (currentDate.isBefore(endDate)) {
        const dateStr = currentDate.format("YYYY-MM-DD");
        if (order.confirmed) {
          confirmed.push(dateStr);
        } else {
          unavailable.push(dateStr);
        }
        currentDate = currentDate.add(1, "day");
      }
    });

    const startEndOverlap = functionToretunrStartEndOverlap(startEnd);

    const { confirmedAndStartEnd, unavailableAndStartEnd } =
      getConfirmedAndUnavailableStartEndDates(
        startEnd,
        confirmedDates,
        unavailableDates
      );
    setOverlapDates([...confirmedAndStartEnd, ...unavailableAndStartEnd]);
    setStartEndOverlapDates(startEndOverlap);
    setUnavailableDates(unavailable);
    setConfirmedDates(confirmed);
    setStartEndDates(startEnd);
  }, [orders]);

  const disabledDate = (current) => {
    const dateStr = current.format("YYYY-MM-DD");
    // Проверяем, является ли дата началом или концом существующего бронирования
    const isStartOrEnd = startEndDates.some((d) => d.date === dateStr);
    const isConfirmed = confirmedDates?.includes(dateStr);
    // Проверяем, есть ли пересечения бронирований
    // const hasOverlappingBookings =
    //   orders.filter((order) => {
    //     const start = dayjs(order.rentalStartDate);
    //     const end = dayjs(order.rentalEndDate);
    //     return current.isBetween(start, end, "day", "[]");
    //   }).length > 1;
    return current.isBefore(dayjs().startOf("day")) || isConfirmed;
  };

  const renderDateCell = (date) => {
    const [start, end] = selectedRange;
    const dateStr = date.format("YYYY-MM-DD");
    const isSelected =
      (date >= start && date <= end) ||
      date.isSame(start, "day") ||
      date.isSame(end, "day");
    const isConfirmed = confirmedDates?.includes(dateStr);
    const isUnavailable = unavailableDates?.includes(dateStr);
    const startEndInfo = startEndDates.find((d) => d.date === dateStr);
    const isStartDate = startEndInfo?.type === "start";
    const isEndDate = startEndInfo?.type === "end";
    const isStartAndEndDateOverlap = startEndOverlapDates?.includes(dateStr);

    // If selected, these styles will override everything else
    if (isSelected) {
      return (
        <Box
          sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "text.green",
            color: "white",
            border: "1px solid green",
            // Add !important to ensure these styles take precedence
            "& *": {
              backgroundColor: "text.green !important",
              color: "white !important",
              border: "1px solid green !important",
            },
          }}
        >
          {date.date()}
        </Box>
      );
    }

    // Rest of your existing conditions
    let backgroundColor = "transparent";
    let color = "inherit";
    let border = "1px solid grey";
    let borderRadius;

    if (isConfirmed || isStartAndEndDateOverlap) {
      backgroundColor = "primary.red";
      color = "common.white";
    } else if (isUnavailable) {
      backgroundColor = "primary.green";
      color = "common.black";
    }

    if (isStartAndEndDateOverlap || isConfirmed || isUnavailable) {
      return (
        <Box
          sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor,
            borderRadius: "1px",
            color,
            border,
          }}
        >
          {date.date()}
        </Box>
      );
    }

    if (
      startEndInfo &&
      !isEndDate &&
      !isStartAndEndDateOverlap &&
      !isConfirmed &&
      !isUnavailable
    ) {
      return (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
            cursor: "pointer",
            border,
          }}
        >
          <Box
            sx={{
              width: "50%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {date.date()}
          </Box>
          <Box
            sx={{
              width: "50%",
              height: "100%",
              borderRadius: "50% 0 0 50%",
              backgroundColor: startEndInfo.confirmed
                ? "primary.red"
                : "primary.green",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: startEndInfo.confirmed ? "common.white" : "common.black",
            }}
          >
            {date.date()}
          </Box>
        </Box>
      );
    }

    if (
      !isStartDate &&
      isEndDate &&
      !isStartAndEndDateOverlap &&
      !isConfirmed &&
      !isUnavailable
    ) {
      return (
        <Box
          sx={{
            border,
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
            cursor: "pointer",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "50%",
              height: "100%",
              borderRadius: "0 50% 50% 0",
              backgroundColor: startEndInfo.confirmed
                ? "primary.red"
                : "primary.green",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: startEndInfo.confirmed ? "common.white" : "common.black",
            }}
          >
            {date.date()}
          </Box>
          <Box
            sx={{
              width: "50%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {date.date()}
          </Box>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor,
          borderRadius,
          color,
          border,
        }}
      >
        {date.date()}
      </Box>
    );
  };

  const handleBooking = () => {
    onBookingComplete();
    setShowBookButton(false);
  };

  const headerRender = ({ value }) => {
    const current = value.clone();
    const month = current.format("MMMM");
    const year = current.year();

    const goToNextMonth = () => {
      setCurrentDate(currentDate.add(1, "month"));
    };

    const goToPreviousMonth = () => {
      setCurrentDate(currentDate.subtract(1, "month"));
    };

    return (
      <Box
        sx={{
          padding: 1,
          display: "flex",
          color: "common.black",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <IconButton onClick={goToPreviousMonth} color="inherit">
          <ArrowBackIosNewIcon />
        </IconButton>
        <Typography variant="h6" sx={{ margin: 0 }}>
          {`${month} ${year}`}
        </Typography>
        <IconButton onClick={goToNextMonth} color="inherit">
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>
    );
  };

  const onSelect = (date) => {
    const [start, end] = selectedRange;
    const dateStr = date.format("YYYY-MM-DD");

    // Проверяем, является ли выбранная дата началом или концом существующего заказа
    const existingDateInfo = startEndDates.find((d) => d.date === dateStr);
    const timeForDate = existingDateInfo ? existingDateInfo.time : null;

    if (!start || (start && end)) {
      setSelectedRange([date, null]);
      setSelectedTimes({
        start: timeForDate || "14:00",
        end: null,
      });
      setShowBookButton(false);
    } else {
      const range = [start, date].sort((a, b) => a - b);
      const startStr = range[0].format("YYYY-MM-DD");
      const endStr = range[1].format("YYYY-MM-DD");

      // Получаем информацию о времени для начальной и конечной дат
      const startDateInfo = startEndDates.find((d) => d.date === startStr);
      const endDateInfo = startEndDates.find((d) => d.date === endStr);

      setSelectedRange(range);
      setSelectedTimes({
        start:
          selectedTimes.start || (startDateInfo ? startDateInfo.time : "14:00"),
        end: timeForDate || (endDateInfo ? endDateInfo.time : "12:00"),
      });

      setBookedDates({
        start: range[0],
        end: range[1],
        startTime:
          selectedTimes.start || (startDateInfo ? startDateInfo.time : "14:00"),
        endTime: timeForDate || (endDateInfo ? endDateInfo.time : "12:00"),
      });
      setShowBookButton(true);
    }
  };

  return (
    <Box sx={{ width: "100%", p: "20px" }}>
      <Typography
        variant="h6"
        sx={{
          lineHeight: "1.3rem",
          letterSpacing: "0.1rem",
          textTransform: "uppercase",
          marginBottom: "20px",
          color: "primary.main",
        }}
      >
        Choose your dates for booking
      </Typography>
      <Box
        sx={{
          marginBottom: "10px",
          justifyContent: "center",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box
          component="span"
          sx={{
            display: "inline-block",
            width: "20px",
            height: "20px",
            backgroundColor: "primary.red",
            marginRight: "10px",
          }}
        />
        <Typography component="span" variant="body2">
          Confirmed bookings
        </Typography>
      </Box>
      <Box
        sx={{
          marginBottom: "10px",
          justifyContent: "center",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box
          component="span"
          sx={{
            display: "inline-block",
            width: "20px",
            height: "20px",
            backgroundColor: "primary.green",
            marginRight: "10px",
          }}
        />
        <Typography component="span" variant="body2">
          Unconfirmed bookings
        </Typography>
      </Box>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          <Calendar
            fullscreen={false}
            onSelect={onSelect}
            disabledDate={disabledDate}
            fullCellRender={renderDateCell}
            headerRender={headerRender}
            value={currentDate}
          />
          {showBookButton && (
            <DefaultButton
              onClick={handleBooking}
              blinking={true}
              label={`Book ${selectedRange[0].format("MMM D")} ${
                selectedTimes.start
              } - ${selectedRange[1].format("MMM D")} ${selectedTimes.end}`}
              relative={true}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default CalendarPicker;
