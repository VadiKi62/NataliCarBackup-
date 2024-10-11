import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Modal,
  Paper,
} from "@mui/material";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween); // Extend dayjs to include the isBetween function

exports.renderDateCell = (date) => {
  const dateStr = date.format("YYYY-MM-DD");

  const isConfirmed = confirmedDates.includes(dateStr);
  const isUnavailable = unavailableDates.includes(dateStr);

  let isStartDate = false;
  let isEndDate = false;
  let isOverlapStartEnd = false; // Overlap only on start and end
  let isFullOverlap = false; // Overlap within full range (including between dates)
  let overlapOrders = [];

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

    // Check if current date is within the range of an order
    if (dayjs(dateStr).isBetween(rentalStart, rentalEnd, "day", "[]")) {
      overlapOrders.push(order);
    }
  });

  const overlapCount = overlapOrders.length;

  // Case 1: Start and End Overlap (current date is both a start and end date)
  if (overlapCount > 1) {
    const isStartEndOverlap = overlapOrders.some((order) => {
      const rentalStart = dayjs(order.rentalStartDate).format("YYYY-MM-DD");
      const rentalEnd = dayjs(order.rentalEndDate).format("YYYY-MM-DD");

      return rentalStart === dateStr && rentalEnd === dateStr;
    });

    if (isStartEndOverlap) {
      isOverlapStartEnd = true;
    }

    // Case 2: Full overlap, including dates between start and end
    const isInBetweenOverlap = overlapOrders.some((order) => {
      const rentalStart = dayjs(order.rentalStartDate).format("YYYY-MM-DD");
      const rentalEnd = dayjs(order.rentalEndDate).format("YYYY-MM-DD");

      return (
        dayjs(dateStr).isAfter(rentalStart, "day") &&
        dayjs(dateStr).isBefore(rentalEnd, "day")
      );
    });

    if (isInBetweenOverlap) {
      isFullOverlap = true;
    }
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

  if (isStartDate && !isFullOverlap && !isOverlapStartEnd) {
    borderRadius = "50% 0 0 50%"; // Rounded on the left for start
    backgroundColor = "text.green";
  }
  if (isEndDate && !isFullOverlap && !isOverlapStartEnd) {
    borderRadius = "0 50% 50% 0"; // Rounded on the right for end
    backgroundColor = "text.green";
  }

  // Create vertical lines for overlap dates
  const overlapLines = [];
  if (isOverlapStartEnd) {
    backgroundColor = "text.yellow"; // Color for start-end overlap
    color = "common.white";
    overlapLines.push(
      <Box
        key={"overlap-start-end"}
        sx={{
          position: "absolute",
          height: "100%",
          width: "2px",
          backgroundColor: "primary.yellow", // Line color for start-end overlap
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
    );
  } else if (isFullOverlap) {
    backgroundColor = "text.orange"; // Color for full range overlap
    color = "common.white";

    // Create 3 vertical lines depending on the overlap count (limiting to 3)
    for (let i = 0; i < Math.min(overlapCount, 3); i++) {
      overlapLines.push(
        <Box
          key={i}
          sx={{
            position: "absolute",
            height: "100%",
            width: "2px",
            backgroundColor: "primary.orange", // Line color for full range overlap
            left: `${30 + i * 15}%`, // Spacing lines evenly across the box
            transform: "translateX(-50%)",
          }}
        />
      );
    }
  }

  const handleDateClick = () => {
    const firstCheck =
      confirmedDates.includes(dateStr) || unavailableDates.includes(dateStr);

    if (!firstCheck) {
      setSelectedOrder(null);
    } else {
      const selectedOrder = orders.find((order) => {
        const rentalStart = dayjs(order.rentalStartDate).format("YYYY-MM-DD");
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
        position: "relative",
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
};
