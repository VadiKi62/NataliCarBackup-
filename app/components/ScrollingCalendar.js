import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton, Divider } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import dayjs from 'dayjs';

function ScrollingCalendar({ onDateSelect, datesNotForBooking = { start: null, end: null } }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  useEffect(() => {
    const currentMonthDays = [];
    const startOfMonth = currentMonth.startOf("month");
    const daysInCurrentMonth = currentMonth.daysInMonth();

    for (let i = 1; i <= daysInCurrentMonth; i++) {
      currentMonthDays.push(startOfMonth.date(i));
    }

    setDaysInMonth(currentMonthDays);
  }, [currentMonth]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };

  const goToNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  };

  const isDateDisabled = (date) => {
    if (datesNotForBooking.start && datesNotForBooking.end) {
      const currentDate = dayjs(date);
      const startDate = dayjs(datesNotForBooking.start);
      const endDate = dayjs(datesNotForBooking.end);
      return currentDate.isAfter(startDate) && currentDate.isBefore(endDate) ||
             currentDate.isSame(startDate) || currentDate.isSame(endDate);
    }
    return false;
  };

  return (
    <Box
      sx={{
        overflowX: "auto",
        display: "flex",
        width: "calc(100% - 40px)",
        flexDirection: "column",
        alignItems: "center",
        mt: 3,
        mb: 3,
        bgcolor: "secondary.background1",
        boxShadow: 1,
        borderRadius: 1,
      }}
    >
      <Typography variant="body2" sx={{textTransform:"uppercase", py: 2, color:"warning.main"}}>
        Choose your dates for booking
      </Typography>
      <Box sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        justifyContent: "space-between",
        px: 2,
        mb: 2,
      }}>
        <IconButton onClick={goToPreviousMonth} size="small">
          <ArrowBackIosIcon fontSize="small" />
        </IconButton>
        <Typography variant="h6">
          {currentMonth.format("MMMM YYYY")}
        </Typography>
        <IconButton onClick={goToNextMonth} size="small">
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider sx={{ width: "100%", mb: 2 }} />

      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          width: "100%",
          justifyContent: "center",
          px: 2,
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {daysInMonth.map((day) => {
          const formattedDate = day.format("YYYY-MM-DD");
          const isDisabled = isDateDisabled(formattedDate);
          return (
            <Button
              key={formattedDate}
              variant={selectedDate === formattedDate ? "contained" : "outlined"}
              sx={{
                minWidth: 40,
                height: 40,
                m: 0.5,
                flexShrink: 0,
                fontSize: '0.75rem',
                ...(isDisabled && {
                  backgroundColor: 'secondary.light',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'secondary.main',
                  },
                }),
              }}
              onClick={() => !isDisabled && handleDateClick(formattedDate)}
              disabled={isDisabled}
            >
              <Typography variant="body2">{day.format("D")}</Typography>
            </Button>
          );
        })}
      </Box>
    </Box>
  );
}

export default ScrollingCalendar;