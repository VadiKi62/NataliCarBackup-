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
  extractArraysOfStartEndConfPending,
} from "@utils/functions";
import { analyzeDates } from "@utils/analyzeDates";
import Tooltip from "@mui/material/Tooltip";

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

  useEffect(() => {
    // функция которая возвращает 4 массива дат для удобного рендеринга клиентского календаря
    const { unavailable, confirmed, startEnd, transformedStartEndOverlap } =
      extractArraysOfStartEndConfPending(orders);

    // тестим в консоли на конкретной машине
    // if (carId === "670bb226223dd911f0595287") {
    //   console.log("startEnd DAYS", startEnd);
    //   console.log("transformedStartEnd", transformedStartEndOverlap);
    // }
    // задаем єти 4 массива в стейт
    setStartEndOverlapDates(transformedStartEndOverlap);
    setUnavailableDates(unavailable);
    setConfirmedDates(confirmed);
    setStartEndDates(startEnd);
  }, [orders]);

  const renderDateCell = (date) => {
    // выбранные даты
    const [start, end] = selectedRange;
    const isSelected =
      (date >= start && date <= end) ||
      date.isSame(start, "day") ||
      date.isSame(end, "day");
    // текущая дата вокруг которой будет рендер и которая будет сравниваться
    const dateStr = date.format("YYYY-MM-DD");
    // проверяем подтвержденная ли єто дата
    const isConfirmed = confirmedDates?.includes(dateStr);
    // проверяем ожидающая ли єто дата (еще не подтвердженная)
    const isUnavailable = unavailableDates?.includes(dateStr);
    // проверяем начальная или конечная ли єто дата
    const startEndInfo = startEndDates.find((d) => d.date === dateStr);
    // проверяем начальная ли єто дата
    const isStartDate = startEndInfo?.type === "start";
    // проверяем конечная ли єто дата
    const isEndDate = startEndInfo?.type === "end";

    // проверяем чтобы эта дата не была одновременно начальной и конечной для разных броинрований
    const isStartAndEndDateOverlapInfo = startEndOverlapDates?.find(
      (dateObj) => dateObj.date === dateStr
    );
    // если предыдущая функция нашла что-то, то эта вернет тру, и если нет таких дат, которые начальные и конечные тогда это будет фолс
    const isStartAndEndDateOverlap = Boolean(isStartAndEndDateOverlapInfo);

    // тест в консоли для конкретной машины
    if (carId === "670bb226223dd911f0595287" && isStartAndEndDateOverlap) {
      console.log("isStartAndEndDateOverlapInfo", isStartAndEndDateOverlapInfo);
    }

    // ДАЛЬШЕ КОД ВНЕДРЯЕТ СТИЛИ для каждого типа

    const getTooltipMessage = () => {
      if (isConfirmed) return "This date is unavailable.";
      if (isUnavailable)
        return "This date is pending approval. Maybe available but not 100%";
      if (isStartDate && isEndDate)
        return "This date overlaps as a start and end.";
      return null;
    };

    const tooltipMessage = getTooltipMessage();

    // здесь задаем базовые значения для - бекграунд цвета ячейки, цвета таекста, рамки, радиуса рамки
    // Rest of your existing conditions
    let backgroundColor = "transparent";
    let color = "inherit";
    let border = "1px solid grey";
    let borderRadius;

    // Общие стили
    const baseStyles = {
      height: "100%",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };

    //если мы тыкаем в ячейку то все предыдущие стили переписываются
    // If selected, these styles will override everything else
    if (isSelected) {
      return (
        <Box
          sx={{
            ...baseStyles,
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

    if (
      isConfirmed ||
      isStartAndEndDateOverlapInfo?.endConfirmed ||
      isStartAndEndDateOverlapInfo?.startConfirmed
    ) {
      backgroundColor = "primary.red";
      color = "common.white";
    } else if (
      isUnavailable ||
      isStartAndEndDateOverlapInfo?.endPending ||
      isStartAndEndDateOverlapInfo?.startPending
    ) {
      backgroundColor = "primary.green";
      color = "common.black";
    }

    if (isConfirmed || isUnavailable) {
      return (
        <Tooltip title={tooltipMessage || ""} placement="top" arrow>
          <Box
            sx={{
              ...baseStyles,
              backgroundColor,
              borderRadius: "1px",
              color,
              border,
            }}
          >
            {date.date()}
          </Box>
        </Tooltip>
      );
    }

    if (isStartDate && !isEndDate && !isStartAndEndDateOverlap) {
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

    if (!isStartDate && isEndDate && !isStartAndEndDateOverlap) {
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

    // For overlapping start/end dates
    if (isStartAndEndDateOverlap) {
      return (
        <Box
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
          {/* End Date Box - Left half */}
          <Box
            sx={{
              width: "50%",
              height: "100%",
              backgroundColor: isStartAndEndDateOverlapInfo.endConfirmed
                ? "primary.main"
                : "primary.green",
              borderRadius: "0 50% 50% 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "common.white",
            }}
          >
            {date.date()}
          </Box>

          {/* Start Date Box - Right half */}
          <Box
            sx={{
              width: "50%",
              height: "100%",
              backgroundColor: isStartAndEndDateOverlapInfo.startConfirmed
                ? "primary.main"
                : "primary.green",
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
    //если ничего из меречисленного не работает то рендерить прозрачно
    return (
      <Box
        sx={{
          ...baseStyles,
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

  // const onSelect = (date) => {
  //   const [start, end] = selectedRange;
  //   const dateStr = date.format("YYYY-MM-DD");

  //   // Проверяем, является ли выбранная дата началом или концом существующего заказа
  //   const existingDateInfo = startEndDates.find((d) => d.date === dateStr);
  //   const timeForDate = existingDateInfo ? existingDateInfo.time : null;

  //   if (!start || (start && end)) {
  //     setSelectedRange([date, null]);
  //     setSelectedTimes({
  //       start: timeForDate || "14:00",
  //       end: null,
  //     });
  //     setShowBookButton(false);
  //   } else {
  //     const range = [start, date].sort((a, b) => a - b);
  //     const startStr = range[0].format("YYYY-MM-DD");
  //     const endStr = range[1].format("YYYY-MM-DD");

  //     // Получаем информацию о времени для начальной и конечной дат
  //     const startDateInfo = startEndDates.find((d) => d.date === startStr);
  //     const endDateInfo = startEndDates.find((d) => d.date === endStr);

  //     setSelectedRange(range);
  //     setSelectedTimes({
  //       start:
  //         selectedTimes.start || (startDateInfo ? startDateInfo.time : "14:00"),
  //       end: timeForDate || (endDateInfo ? endDateInfo.time : "12:00"),
  //     });

  //     setBookedDates({
  //       start: range[0],
  //       end: range[1],
  //       startTime:
  //         selectedTimes.start || (startDateInfo ? startDateInfo.time : "14:00"),
  //       endTime: timeForDate || (endDateInfo ? endDateInfo.time : "12:00"),
  //     });
  //     setShowBookButton(true);
  //   }
  // };

  const onSelect = (date) => {
    const [start, end] = selectedRange;
    const dateStr = date.format("YYYY-MM-DD");

    // Find time information for the selected date
    const existingDateInfo = startEndDates.find((d) => d.date === dateStr);
    const timeForDate = existingDateInfo ? existingDateInfo.time : null;

    if (!start || (start && end)) {
      // First click or resetting the range
      setSelectedRange([date, null]);
      setSelectedTimes({
        start: timeForDate || "14:00",
        end: null,
      });
      setShowBookButton(false);
    } else {
      if (date.isBefore(start)) {
        // If the second date is before the first, make it the new start
        setSelectedRange([date, null]);
        setSelectedTimes({
          start: timeForDate || "14:00",
          end: null,
        });
        setShowBookButton(false);
      } else if (date.isSame(start, "day")) {
        // Prevent selecting the same date as both start and end
        setSelectedRange([start, null]);
        setSelectedTimes({
          start: selectedTimes.start || "14:00",
          end: null,
        });
        setShowBookButton(false);
      } else {
        // Regular behavior: set range with start and end dates
        const range = [start, date];
        const startStr = range[0].format("YYYY-MM-DD");
        const endStr = range[1].format("YYYY-MM-DD");

        // Retrieve time info for start and end dates
        const startDateInfo = startEndDates.find((d) => d.date === startStr);
        const endDateInfo = startEndDates.find((d) => d.date === endStr);

        setSelectedRange(range);
        setSelectedTimes({
          start:
            selectedTimes.start ||
            (startDateInfo ? startDateInfo.time : "14:00"),
          end: timeForDate || (endDateInfo ? endDateInfo.time : "12:00"),
        });
        setBookedDates({
          start: range[0],
          end: range[1],
          startTime:
            selectedTimes.start ||
            (startDateInfo ? startDateInfo.time : "14:00"),
          endTime: timeForDate || (endDateInfo ? endDateInfo.time : "12:00"),
        });

        setShowBookButton(true);
      }
    }
  };

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
      {/* <Box
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
      </Box> */}
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
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
          <Calendar
            fullscreen={false}
            onSelect={onSelect}
            disabledDate={disabledDate}
            fullCellRender={renderDateCell}
            headerRender={headerRender}
            value={currentDate}
          />
        </>
      )}
    </Box>
  );
};

export default CalendarPicker;
