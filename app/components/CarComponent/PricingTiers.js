import React from "react";
import { Paper, Stack, Typography, Divider } from "@mui/material";
import dayjs from "dayjs";

const seasons = {
  NoSeason: { start: "01/10", end: "24/05" },
  LowSeason: { start: "25/05", end: "30/06" },
  LowUpSeason: { start: "01/09", end: "30/09" },
  Middle: { start: "01/07", end: "31/07" },
  Height: { start: "01/08", end: "31/08" },
};

// Function to get the current season (same as above)
const getCurrentSeason = () => {
  const today = dayjs();
  const currentYear = today.year();

  for (const [season, range] of Object.entries(seasons)) {
    const startDate = dayjs(`${range.start}/${currentYear}`, "DD/MM/YYYY");
    const endDate = dayjs(`${range.end}/${currentYear}`, "DD/MM/YYYY");

    if (today.isAfter(startDate) && today.isBefore(endDate)) {
      return season;
    }
  }

  return "NoSeason"; // Default season
};

// PricingDisplay component to show current season pricing
const PricingDisplay = ({ prices }) => {
  const currentSeason = getCurrentSeason(); // Get current season
  const pricingData = prices[currentSeason]?.days || {}; // Get the days and amounts for the current season

  return (
    <>
      {" "}
      <Typography>
        Prices for current Season - {currentSeason} (from{" "}
        {seasons[currentSeason].start} till {seasons[currentSeason].end} )
      </Typography>
      <Paper
        elevation={0}
        sx={{
          padding: { xs: 1.8, sm: 3 },
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
          backgroundColor: "secondary.light",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: 0,
          }}
        >
          {/* Map over the day tiers and prices */}
          {Object.entries(pricingData).map(([days, amount], index) => (
            <React.Fragment key={index}>
              <Stack direction="column" alignItems="center">
                <Typography
                  sx={{
                    lineHeight: { xs: "0.9rem", sm: "0.9rem" },
                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    mb: 1,
                  }}
                >
                  Up to {days} days
                </Typography>

                <Typography
                  sx={{
                    lineHeight: { xs: "1rem", sm: "1.2rem" },
                    fontSize: { xs: "1rem", sm: "1.2rem" },
                  }}
                  color="primary"
                >
                  ${amount}
                </Typography>
              </Stack>

              {/* Divider between prices */}
              {index + 1 < Object.entries(pricingData).length && (
                <Divider orientation="vertical" flexItem />
              )}
            </React.Fragment>
          ))}
        </Stack>
      </Paper>
    </>
  );
};

export default PricingDisplay;
