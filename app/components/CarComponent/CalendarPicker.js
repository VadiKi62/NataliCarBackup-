import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import { Calendar } from "antd";
import dayjs from "dayjs";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DefaultButton from "../common/DefaultButton";

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
        unavailable.push(dateStr);
        if (order.confirmed) {
          confirmed.push(dateStr);
        }
        currentDate = currentDate.add(1, "day");
      }
    });

    setUnavailableDates(unavailable);
    setConfirmedDates(confirmed);
    setStartEndDates(startEnd);
  }, [orders]);

  const disabledDate = (current) => {
    const dateStr = current.format("YYYY-MM-DD");
    const isStartOrEnd = startEndDates.some((d) => d.date === dateStr);

    return (
      (current && current.isBefore(dayjs().startOf("day"))) ||
      (current &&
        current.isBefore(dayjs().startOf("day")) &&
        !isStartOrEnd &&
        confirmedDates?.includes(dateStr)) ||
      (!isStartOrEnd && confirmedDates?.includes(dateStr))
    );
  };

  const renderDateCell = (date) => {
    const [start, end] = selectedRange;
    const dateStr = date.format("YYYY-MM-DD");
    const isConfirmed = confirmedDates?.includes(dateStr);
    const isUnavailable = unavailableDates?.includes(dateStr);

    const isSelected =
      (date >= start && date <= end) ||
      date.isSame(start, "day") ||
      date.isSame(end, "day");

    const startEndInfo = startEndDates.find((d) => d.date === dateStr);
    const isStartOrEnd = !!startEndInfo;

    // Добавляем проверку на наличие даты с типом "start" и "end"
    const isStartAndEnd =
      startEndDates.filter((d) => d.date === dateStr).length === 2;

    // Проверяем, является ли дата внутренней в других бронированиях
    const isInnerDate = startEndDates.some(
      (d) =>
        d.date === dateStr &&
        d.type === "start" &&
        startEndDates.some((e) => e.date === dateStr && e.type === "end")
    );

    let content = (
      <Box
        sx={{
          position: "relative",
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isStartOrEnd || isStartAndEnd || isInnerDate ? (
          <>
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
              }}
            >
              <Box
                sx={{
                  width:
                    isStartAndEnd || isInnerDate || isSelected ? "100%" : "50%",
                  borderRadius: () => {
                    if (
                      isStartOrEnd &&
                      !isInnerDate &&
                      !isSelected &&
                      startEndInfo.type === "end"
                    ) {
                      return "0 20% 20% 0";
                    }
                    if (
                      startEndInfo.type === "start" &&
                      !isInnerDate &&
                      !isSelected
                    ) {
                      return "20% 0 0 20%";
                    }
                    return undefined;
                  },
                  height: "100%",
                  backgroundColor: isSelected
                    ? "text.green"
                    : isStartAndEnd || isInnerDate
                    ? startEndInfo.confirmed
                      ? "primary.red"
                      : "primary.green"
                    : startEndInfo.type === "end"
                    ? startEndInfo.confirmed
                      ? "primary.red"
                      : "primary.green"
                    : "transparent",
                }}
              />
              {!isStartAndEnd &&
                !isInnerDate &&
                startEndInfo.type === "start" && (
                  <Box
                    sx={{
                      width: "50%",
                      height: "100%",
                      backgroundColor: isSelected
                        ? "text.green"
                        : startEndInfo.confirmed
                        ? "primary.red"
                        : "primary.green",
                    }}
                  />
                )}
            </Box>
            <Typography
              sx={{
                position: "relative",
                zIndex: 1,
                fontSize: "0.8rem",
              }}
            >
              {date.date()}
            </Typography>
            {/* <Typography
              sx={{
                position: "relative",
                zIndex: 1,
                color: startEndInfo.confirmed ? "primary.green" : "black",
                fontSize: "0.6rem",
              }}
            >
              {startEndInfo.time}
            </Typography>{" "}
          </> */}
          </>
        ) : (
          <Box
            sx={{
              height: "100%",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isConfirmed ? "white" : "dark",
              backgroundColor: isSelected
                ? "text.green"
                : isStartAndEnd || isInnerDate
                ? startEndInfo.confirmed
                  ? "primary.red"
                  : "primary.green"
                : isConfirmed
                ? "primary.red"
                : isUnavailable
                ? "primary.green"
                : "transparent",
              color:
                isSelected || isConfirmed || isStartAndEnd || isInnerDate
                  ? "common.white"
                  : "inherit",
            }}
          >
            {date.date()}
          </Box>
        )}
      </Box>
    );

    return content;
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
