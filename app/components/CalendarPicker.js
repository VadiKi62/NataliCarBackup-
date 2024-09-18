import React, { useState, useMemo } from "react";
import { Calendar, Select, Row, Col } from "antd";
import dayjs from "dayjs";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const CalendarPicker = ({
  isLoading,
  setBookedDates,
  onBookingComplete,
  orders,
}) => {
  const [selectedRange, setSelectedRange] = useState([null, null]);
  const [currentDate, setCurrentDate] = useState(dayjs());

  const { unavailableDates, confirmedDates } = useMemo(() => {
    const unavailable = [];
    const confirmed = [];

    console.log("orders coming from unav/confirmed dates", orders);
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
        unavailableDates?.includes(current.format("YYYY-MM-DD")))
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
    const isConfirmed = confirmedDates?.includes(dateStr);
    const isUnavailable = unavailableDates?.includes(dateStr);

    let backgroundColor = "transparent";
    let color = "inherit";

    if (isSelected) {
      backgroundColor = "primary.dark";
      color = "white";
    } else if (isConfirmed) {
      backgroundColor = "primary.red";
      color = "common.white";
    } else if (isUnavailable) {
      backgroundColor = "primary.green";
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
          borderRadius: "1px",
          color,
        }}
      >
        {date.date()}
      </Box>
    );
  };

  const headerRender = ({ value, type, onChange, onTypeChange }) => {
    const current = value.clone();
    const month = current.format("MMMM");
    const year = current.year();

    const goToNextMonth = () => {
      // const newDate = currentDate.add(1, "month");
      // onChange(newDate);
      setCurrentDate(currentDate.add(1, "month"));
    };

    const goToPreviousMonth = () => {
      // const newDate = currentDate.subtract(1, "month");
      // onChange(newDate);
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
          alignContent: "center",
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
        ></Box>
        <Typography component="span" variant="body2">
          Confirmed bookings
        </Typography>
      </Box>
      <Box
        sx={{ marginBottom: "10px", justifyContent: "center", display: "flex" }}
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
        ></Box>
        <Typography component="span" variant="body2">
          Unconfirmed bookings
        </Typography>
      </Box>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <Calendar
          fullscreen={false}
          onSelect={onSelect}
          disabledDate={disabledDate}
          fullCellRender={renderDateCell}
          headerRender={headerRender}
          value={currentDate}
        />
      )}
    </Box>
  );
};

export default CalendarPicker;
