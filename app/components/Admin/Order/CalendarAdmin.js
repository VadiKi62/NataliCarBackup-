import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Modal,
  Paper,
  Grid,
} from "@mui/material";
import { Calendar } from "antd";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import LegendCalendarAdmin from "@app/components/common/LegendCalendarAdmin";
import EditOrderModal from "./EditOrderModal";
import {
  functionToretunrStartEndOverlap,
  getConfirmedAndUnavailableStartEndDates,
} from "@utils/functions";

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
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [isConflictOrder, setIsConflictOrder] = useState(false);
  const [startEndOverlapDates, setStartEndOverlapDates] = useState(null);
  const [overlapDates, setOverlapDates] = useState(null);
  const [startEndDates, setStartEndDates] = useState([]);

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

    return (
      (current && current.isBefore(dayjs().startOf("day"))) ||
      (current &&
        current.isBefore(dayjs().startOf("day")) &&
        !isStartOrEnd &&
        confirmedDates?.includes(dateStr))
    );
  };

  const renderDateCell = useCallback(
    (date) => {
      const dateStr = date.format("YYYY-MM-DD");

      const isConfirmed = confirmedDates.includes(dateStr);
      const isUnavailable = unavailableDates.includes(dateStr);

      const startEndInfo = startEndDates.find((d) => d.date === dateStr);
      const isStartDate = startEndInfo?.type === "start";
      const isEndDate = startEndInfo?.type === "end";
      const isStartAndEndDateOverlap = startEndOverlapDates?.includes(dateStr);

      // let isStartDate = false;
      // let isEndDate = false;
      let overlapOrders = [];
      let startDates = [];
      let endDates = [];

      // Check each order and collect overlaps
      orders.forEach((order) => {
        const rentalStart = dayjs(order.rentalStartDate).format("YYYY-MM-DD");
        const rentalEnd = dayjs(order.rentalEndDate).format("YYYY-MM-DD");

        // if (rentalStart === dateStr) {
        //   isStartDate = true;
        //   startDates.push(order);
        // }
        // if (rentalEnd === dateStr) {
        //   isEndDate = true;
        //   endDates.push(order);
        // }

        if (dayjs(dateStr).isBetween(rentalStart, rentalEnd, "day", "[]")) {
          overlapOrders.push(order);
        }
      });

      const isOverlapDate = overlapOrders.length > 1;
      const isStartEndOverlap = startDates.length > 0 && endDates.length > 0;

      let backgroundColor = "transparent";
      let color = "inherit";
      let borderRadius = "1px";
      let width = "100%";
      let border = "1px solid green";

      if (isUnavailable && !isConfirmed) {
        backgroundColor = "primary.green";
        color = "text.dark";
      }
      if (isConfirmed) {
        backgroundColor = "primary.red";
        color = "common.white";
      }

      // Single order date styling
      if (isStartDate && !isEndDate) {
        borderRadius = "50% 0 0 50%";
        width = "50%";
        backgroundColor = "primary.green";
        color = "common.black";
      }
      if (!isStartDate && isEndDate) {
        borderRadius = "0 50% 50% 0";
        width = "50%";
        backgroundColor = "primary.green";
        color = "common.black";
      }

      const handleDateClick = () => {
        const relevantOrders = orders.filter((order) => {
          const rentalStart = dayjs(order.rentalStartDate).format("YYYY-MM-DD");
          const rentalEnd = dayjs(order.rentalEndDate).format("YYYY-MM-DD");

          return dayjs(dateStr).isBetween(rentalStart, rentalEnd, "day", "[]");
        });

        if (relevantOrders.length > 0) {
          setSelectedOrders(relevantOrders);
          setOpen(true);
        }
      };

      if (isOverlapDate && !isStartEndOverlap)
        return (
          <Box
            onClick={handleDateClick}
            sx={{
              border: border,
              position: "relative",
              height: "120%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.red",
              backgroundColor: "text.green",
              cursor: "pointer",
            }}
          >
            {date.date()}
          </Box>
        );

      // For overlapping start/end dates
      if (isStartEndOverlap) {
        return (
          <Box
            onClick={handleDateClick}
            sx={{
              border: border,
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "row",
              cursor: "pointer",
            }}
          >
            {/* Start Date Box - Left half */}
            <Box
              sx={{
                width: "50%",
                height: "100%",
                backgroundColor,
                borderRadius: "0 50% 50% 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
              }}
            >
              {date.date()}
            </Box>

            {/* End Date Box - Right half */}
            <Box
              sx={{
                width: "50%",
                height: "100%",
                backgroundColor: isConfirmed ? "primary.main" : "primary.green",
                borderRadius: "0 50% 50% 0",
                borderRadius: "50% 0 0 50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
              }}
            >
              {date.date()}
            </Box>
          </Box>
        );
      }

      //only start date
      if (isStartDate && !isEndDate && !isOverlapDate)
        return (
          <Box
            onClick={handleDateClick}
            sx={{
              border: border,
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "row",
              cursor: "pointer",
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
              {" "}
              {date.date()}
            </Box>
            <Box
              sx={{
                width: "50%",
                height: "100%",
                borderRadius: "50% 0 0 50%",
                backgroundColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color,
              }}
            >
              {date.date()}
            </Box>
          </Box>
        );

      if (!isStartDate && isEndDate)
        return (
          <Box
            onClick={handleDateClick}
            sx={{
              border: border,
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
                backgroundColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color,
              }}
            >
              {" "}
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
              {" "}
              {date.date()}
            </Box>
          </Box>
        );

      // Regular cell rendering
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
            borderRadius,
            color,
            cursor: "pointer",
            border: border,
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
  const handleSaveOrder = (updatedOrder) => {
    // handleOrderUpdate();
    setSelectedOrders((prevSelectedOrders) =>
      prevSelectedOrders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );

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
      {/* <LegendCalendarAdmin /> */}
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          <Calendar
            fullscreen={false}
            disabledDate={disabledDate}
            fullCellRender={renderDateCell}
            headerRender={headerRender}
            value={currentDate}
          />
        </>
      )}

      <Modal
        open={open}
        onClose={handleClose}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Grid
          container
          spacing={1}
          justifyContent="center"
          sx={{
            maxWidth: "90vw",
            maxHeight: "90vh",
            overflow: "auto",
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "primary.main",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "background.paper",
            },
          }}
        >
          {selectedOrders.map((order, index) => (
            <Grid
              item
              key={order._id}
              xs={12}
              sm={selectedOrders.length === 1 ? 12 : 6}
              md={
                selectedOrders.length === 1
                  ? 12
                  : selectedOrders.length === 2
                  ? 6
                  : selectedOrders.length >= 3 && selectedOrders.length <= 4
                  ? 3
                  : 2
              }
            >
              <EditOrderModal
                order={order}
                open={open}
                onClose={handleClose}
                onSave={handleSaveOrder}
                setCarOrders={setCarOrders}
                isConflictOrder={selectedOrders.length > 1 ? true : false}
                setIsConflictOrder={setIsConflictOrder}
              />
            </Grid>
          ))}
        </Grid>
      </Modal>
    </Box>
  );
};

export default CalendarAdmin;
