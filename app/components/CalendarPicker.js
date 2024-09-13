import React, { useState, useMemo } from "react";
import { Calendar, Typography, Alert } from "antd";
import dayjs from "dayjs";

const CalendarPicker = ({ car, setBookedDates, onBookingComplete }) => {
  const [selectedRange, setSelectedRange] = useState([null, null]);

  const unavailableDates = useMemo(() => {
    if (!car?.orders || car.orders.length === 0) {
      return [];
    }

    const allUnavailableDates = [];
    car.orders.forEach((order) => {
      let currentDate = dayjs(order.rentalStartDate);
      const endDate = dayjs(order.rentalEndDate);

      while (
        currentDate.isBefore(endDate) ||
        currentDate.isSame(endDate, "day")
      ) {
        allUnavailableDates.push(currentDate.format("YYYY-MM-DD"));
        currentDate = currentDate.add(1, "day");
      }
    });

    return allUnavailableDates;
  }, [car.orders]);

  const disabledDate = (current) => {
    return (
      current &&
      (current < dayjs().startOf("day") ||
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
    const isSelected =
      (date >= start && date <= end) ||
      date.isSame(start, "day") ||
      date.isSame(end, "day");

    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isSelected ? "#1890ff" : "transparent",
          borderRadius: "50%",
          color: isSelected ? "white" : "inherit",
        }}
      >
        {date.date()}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "100%", padding: "20px" }}>
      <Typography.Title
        level={5}
        style={{ marginBottom: "20px", color: "#ff4d4f" }}
      >
        Choose your dates for booking
      </Typography.Title>
      {/* <Alert
        message={`Selected Range: ${
          selectedRange[0]?.format("YYYY-MM-DD") || "Start Date"
        } to ${selectedRange[1]?.format("YYYY-MM-DD") || "End Date"}`}
        style={{ marginBottom: "20px" }}
      /> */}
      <Calendar
        fullscreen={false}
        onSelect={onSelect}
        disabledDate={disabledDate}
        dateFullCellRender={renderDateCell}
      />
    </div>
  );
};

export default CalendarPicker;
