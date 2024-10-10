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

const CalendarAdmin = ({ isLoading = false, orders }) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [confirmedDates, setConfirmedDates] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null); // To store the selected booking
  const [open, setOpen] = useState(false); // To control modal visibility

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

      let backgroundColor = "transparent";
      let color = "inherit";

      if (isConfirmed) {
        backgroundColor = "primary.red";
        color = "common.white";
      }
      if (isUnavailable) {
        backgroundColor = "primary.green";
        color = "common.black";
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

          console.log(selectedOrder);
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
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor,
            borderRadius: "1px",
            color,
            cursor: "pointer",
          }}
        >
          {date.date()}
        </Box>
      );
    },
    [confirmedDates, unavailableDates, orders]
  );

  const handleClose = () => setOpen(false);

  // Memoize order save handler
  const handleSaveOrder = useCallback(
    (updatedOrder) => {
      console.log("Order updated:", updatedOrder);
      const updatedOrders = orders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      );
      // handleClose();
    },
    [orders]
  );

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

      {/* Modal for displaying selected booking */}

      {/* <Modal open={open} onClose={handleClose}>
        <Paper
          sx={{
            width: 400,
            maxWidth: "90%",
            p: 4,
            margin: "auto",
            top: "50%",
            transform: "translateY(-50%)",
            position: "relative",
          }}
        >
          {selectedOrder ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Booking Details
              </Typography>
              <Typography variant="body2">
                Customer: {selectedOrder.customerName}
              </Typography>
              <Typography variant="body2">
                Car Model: {selectedOrder.carModel}
              </Typography>
              <Typography variant="body2">
                Rental Start:{" "}
                {dayjs(selectedOrder.rentalStartDate).format("DD-MM-YYYY")}
              </Typography>
              <Typography variant="body2">
                Rental End:{" "}
                {dayjs(selectedOrder.rentalEndDate).format("DD-MM-YYYY")}
              </Typography>
              <Typography variant="body2">
                Confirmed: {selectedOrder.confirmed ? "Yes" : "No"}
              </Typography>
            </Box>
          ) : (
            <Typography>No booking information available.</Typography>
          )}
        </Paper>
      </Modal> */}
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
