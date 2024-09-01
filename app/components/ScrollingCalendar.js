import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Divider, IconButton } from "@mui/material";
import dayjs from "dayjs";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function ScrollingCalendar({ onDateSelect }) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [daysInMonth, setDaysInMonth] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(dayjs());

    // Set up the days of the current month
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

    return (
        <Box
            sx={{
                overflowX: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: 3,
                mb: 3,
                bgcolor: "secondary.background1",
                boxShadow: 1,
                borderRadius: 1,
                width:"350px"
       
            }}
        >
          <Typography variant="body2" sx={{textTransform:"uppercase", pb: 2, color:"warning.main"}}>Choose your dates for booking</Typography>
            {/* Month navigation */}
            <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                width: "100%", 
                justifyContent: "space-between", 
                px: 2, // Padding for spacing in smaller screens
                mb: 2, // Margin bottom for spacing between navigation and dates
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

            {/* Horizontal scrollable dates */}
            <Box
                sx={{
                    display: "flex",
                    overflowX: "auto",
                    width: "100%",
                    justifyContent: "center",
                    px: 1, // Padding for scrolling space
                    '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar
                    msOverflowStyle: 'none',  // IE and Edge
                    scrollbarWidth: 'none',  // Firefox
                }}
            >
                {daysInMonth.map((day) => (
                    <Button
                        key={day.format("YYYY-MM-DD")}
                        variant={selectedDate === day.format("YYYY-MM-DD") ? "contained" : "outlined"}
                        color="primary"
                        sx={{
                            minWidth: 40,
                            height: 40,
                            m: 0.5,
                            flexShrink: 0, // Prevent buttons from shrinking in small screens
                            fontSize: '0.75rem', // Adjust font size for smaller screens
                        }}
                        onClick={() => handleDateClick(day.format("YYYY-MM-DD"))}
                    >
                        <Typography variant="body2">{day.format("D")}</Typography>
                    </Button>
                ))}
            </Box>
        </Box>
    );
}

export default ScrollingCalendar;
