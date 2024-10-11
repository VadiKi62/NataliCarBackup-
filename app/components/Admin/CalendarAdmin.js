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
import dayjs from "dayjs";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DefaultButton from "@app/components/common/DefaultButton";
import EditOrderModal from "./EditOrderModal";

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
        // backgroundColor = "text.green";
      }
      if (isEndDate && !isOverlapDate) {
        borderRadius = "0 50% 50% 0"; // Rounded on the right for end
        // backgroundColor = "text.green";
      }

      // Create vertical lines for overlap dates
      const overlapLines = [];
      if (isOverlapDate) {
        backgroundColor = "text.green";
        color = "common.white";

        // Create 3 or more vertical lines depending on how many overlaps exist
        for (let i = 0; i < Math.min(overlapCount, 3); i++) {
          overlapLines.push(
            <Box
              key={i}
              sx={{
                position: "absolute",
                height: "100%",
                width: "2px", // Thickness of each line
                backgroundColor: "primary.main", // Line color
                left: `${30 + i * 15}%`, // Spacing lines evenly across the box
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
            position: "relative", // Ensure positioning for ::before
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

  // const renderDateCell = useCallback(
  //   (date) => {
  //     const dateStr = date.format("YYYY-MM-DD");

  //     const isConfirmed = confirmedDates.includes(dateStr);
  //     const isUnavailable = unavailableDates.includes(dateStr);

  //     let isStartDate = false;
  //     let isEndDate = false;
  //     let isOverlapDate = false;

  //     orders.forEach((order) => {
  //       const rentalStart = dayjs(order.rentalStartDate).format("YYYY-MM-DD");
  //       const rentalEnd = dayjs(order.rentalEndDate).format("YYYY-MM-DD");

  //       if (rentalStart === dateStr) {
  //         isStartDate = true;
  //       }
  //       if (rentalEnd === dateStr) {
  //         isEndDate = true;
  //       }

  //       // Check if current date is both the start of one order and the end of another
  //       orders.forEach((otherOrder) => {
  //         const otherRentalStart = dayjs(otherOrder.rentalStartDate).format(
  //           "YYYY-MM-DD"
  //         );
  //         const otherRentalEnd = dayjs(otherOrder.rentalEndDate).format(
  //           "YYYY-MM-DD"
  //         );

  //         if (rentalEnd === dateStr && otherRentalStart === dateStr) {
  //           isOverlapDate = true;
  //         }
  //       });
  //     });

  //     let backgroundColor = "transparent";
  //     let color = "inherit";
  //     let borderRadius = "1px";

  //     if (isConfirmed) {
  //       backgroundColor = "primary.red";
  //       color = "common.white";
  //     }
  //     if (isUnavailable && !isConfirmed) {
  //       backgroundColor = "primary.green";
  //       color = "common.black";
  //     }

  //     if (isStartDate && !isOverlapDate) {
  //       borderRadius = "50% 0 0 50%"; // Rounded on the left for start
  //       // backgroundColor = "text.green";
  //     }
  //     if (isEndDate && !isOverlapDate) {
  //       borderRadius = "0 50% 50% 0"; // Rounded on the right for end
  //       // backgroundColor = "text.green";
  //     }

  //     // Apply specific style for overlap dates with vertical line
  //     if (isOverlapDate) {
  //       backgroundColor = "text.green";
  //       color = "common.white";

  //       // Vertical line in the middle of the box using ::before
  //     }

  //     const handleDateClick = () => {
  //       const firstCheck =
  //         confirmedDates.includes(dateStr) ||
  //         unavailableDates.includes(dateStr);

  //       if (!firstCheck) {
  //         setSelectedOrder(null);
  //       } else {
  //         const selectedOrder = orders.find((order) => {
  //           const rentalStart = dayjs(order.rentalStartDate).format(
  //             "YYYY-MM-DD"
  //           );
  //           const rentalEnd = dayjs(order.rentalEndDate).format("YYYY-MM-DD");

  //           return (
  //             rentalStart === dateStr ||
  //             rentalEnd === dateStr ||
  //             (dayjs(rentalStart).isBefore(dateStr, "day") &&
  //               dayjs(rentalEnd).isAfter(dateStr, "day"))
  //           );
  //         });

  //         if (selectedOrder) {
  //           setSelectedOrder(selectedOrder);
  //           setOpen(true);
  //         }
  //       }
  //     };

  //     return (
  //       <Box
  //         onClick={handleDateClick}
  //         sx={{
  //           position: "relative", // Ensure positioning for ::before
  //           height: "100%",
  //           display: "flex",
  //           alignItems: "center",
  //           justifyContent: "center",
  //           backgroundColor,
  //           borderRadius, // Adjust borderRadius for first/last days
  //           color,
  //           cursor: "pointer",
  //           "::before": isOverlapDate
  //             ? {
  //                 content: '""',
  //                 position: "absolute",
  //                 height: "90%", // Height of the vertical line
  //                 width: "1px", // Thickness of the line
  //                 backgroundColor: "primary.red", // Line color
  //                 left: "50%", // Center the line horizontally
  //                 transform: "translateX(-50%)", // Adjust for exact centering
  //               }
  //             : {},
  //         }}
  //       >
  //         {date.date()}
  //       </Box>
  //     );
  //   },
  //   [confirmedDates, unavailableDates, orders]
  // );

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
