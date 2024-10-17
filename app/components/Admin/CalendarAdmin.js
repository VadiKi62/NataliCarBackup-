import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Modal,
  Paper,
} from "@mui/material";
import { Calendar } from "antd";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import LegendCalendarAdmin from "@app/components/common/LegendCalendarAdmin";
import EditOrderModal from "./EditOrderModal";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

const CalendarAdmin = ({
  isLoading = false,
  orders,
  handleOrderUpdate,
  setCarOrders,
}) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [confirmedDates, setConfirmedDates] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
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

    setUnavailableDates(unavailable);
    setConfirmedDates(confirmed);
  }, [orders]);
  const renderDateCell = useCallback(
    (date) => {
      const dateStr = date.format("YYYY-MM-DD");

      const isConfirmed = confirmedDates.includes(dateStr);
      const isUnavailable = unavailableDates.includes(dateStr);

      let isStartDate = false;
      let isEndDate = false;
      let overlapOrders = [];
      let isOverlapStartEndOnly = false; // New flag to track start/end overlap without in-between overlap

      // Check each order and collect overlaps
      orders.forEach((order) => {
        const rentalStart = dayjs(order.rentalStartDate).format("YYYY-MM-DD");
        const rentalEnd = dayjs(order.rentalEndDate).format("YYYY-MM-DD");

        if (rentalStart === dateStr) {
          isStartDate = true;
        }
        if (rentalEnd === dateStr) {
          isEndDate = true;
        }

        // Check if current date falls within the range of an order
        if (dayjs(dateStr).isBetween(rentalStart, rentalEnd, "day", "[]")) {
          overlapOrders.push(order);
        }
      });

      const isOverlapDate = overlapOrders.length > 1; // More than one order overlaps this date
      const overlapCount = overlapOrders.length;

      // New logic: Check if the current date is overlapping but only as start/end
      if (isOverlapDate) {
        isOverlapStartEndOnly = overlapOrders.every((order) => {
          const rentalStart = dayjs(order.rentalStartDate).format("YYYY-MM-DD");
          const rentalEnd = dayjs(order.rentalEndDate).format("YYYY-MM-DD");
          return rentalStart === dateStr || rentalEnd === dateStr;
        });
      }

      let backgroundColor = "transparent";
      let color = "inherit";
      let borderRadius = "1px";

      if (isConfirmed) {
        backgroundColor = "primary.red";
        color = "common.white";
      }
      if (isUnavailable && !isConfirmed) {
        backgroundColor = "primary.green";
        color = "common.black";
      }

      if (isStartDate && !isOverlapDate) {
        borderRadius = "50% 0 0 50%"; // Rounded on the left for start
      }
      if (isEndDate && !isOverlapDate) {
        borderRadius = "0 50% 50% 0"; // Rounded on the right for end
      }

      // Create vertical lines for overlap dates
      const overlapLines = [];
      if (isOverlapStartEndOnly) {
        backgroundColor = "text.green";

        // Dotted vertical line for start/end overlap only
        overlapLines.push(
          <Box
            sx={{
              position: "absolute",
              height: "100%",
              color: "white",
              left: "50%",
              transform: "translateX(-50%)",
              borderRight: "2px dotted",
            }}
          />
        );
      } else if (isOverlapDate) {
        backgroundColor = "text.green"; // Color for full range overlap
        color = "common.white";

        // Create solid vertical lines for full overlap (up to 3 lines)
        for (let i = 1; i < Math.min(overlapCount, 3); i++) {
          overlapLines.push(
            <Box
              key={`overlap-line-${i}`}
              sx={{
                position: "absolute",
                height: "100%",
                width: "1px", // Thickness of each line
                backgroundColor: "primary.main", // Line color for full overlap
                left: `${35 + i * 15}%`, // Spacing lines evenly across the box
                transform: "translateX(-50%)",
              }}
            />
          );
        }
      }

      const handleDateClick = () => {
        const firstCheck =
          confirmedDates.includes(dateStr) ||
          unavailableDates.includes(dateStr);

        if (!firstCheck) {
          setSelectedOrder(null);
        } else {
          const selectedOrder = orders.find((order) => {
            const rentalStart = dayjs(order.rentalStartDate).format(
              "YYYY-MM-DD"
            );
            const rentalEnd = dayjs(order.rentalEndDate).format("YYYY-MM-DD");

            return (
              rentalStart === dateStr ||
              rentalEnd === dateStr ||
              (dayjs(rentalStart).isBefore(dateStr, "day") &&
                dayjs(rentalEnd).isAfter(dateStr, "day"))
            );
          });

          if (selectedOrder) {
            setSelectedOrder(selectedOrder);
            setOpen(true);
          }
        }
      };

      return (
        <Box
          onClick={handleDateClick}
          sx={{
            position: "relative", // Ensure positioning for overlap lines
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor,
            borderRadius, // Adjust borderRadius for first/last days
            color,
            cursor: "pointer",
          }}
        >
          {overlapLines}
          {date.date()}
        </Box>
      );
    },
    [confirmedDates, unavailableDates, orders]
  );

  const handleClose = () => setOpen(false);

  // Memoize order save handler
  const handleSaveOrder = (updatedOrder) => {
    handleOrderUpdate(updatedOrder);
    setSelectedOrder(updatedOrder);
    const updatedOrders = orders.map((order) =>
      order._id === updatedOrder._id ? updatedOrder : order
    );
    setCarOrders(updatedOrders);
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
      <LegendCalendarAdmin />
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          <Calendar
            fullscreen={false}
            fullCellRender={renderDateCell}
            headerRender={headerRender}
            value={currentDate}
          />
        </>
      )}

      <EditOrderModal
        open={open}
        onClose={handleClose}
        order={selectedOrder}
        onSave={handleSaveOrder}
      />
    </Box>
  );
};

export default CalendarAdmin;
