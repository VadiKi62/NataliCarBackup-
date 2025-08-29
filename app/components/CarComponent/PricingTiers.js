import React, { useState, useEffect } from "react";
import { Paper, Stack, Typography, Divider } from "@mui/material";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import { seasons } from "@utils/companyData";
import { useTranslation } from "@node_modules/react-i18next";

// Function to get the current season (same as above)
// const getCurrentSeason = (date = dayjs()) => {
//   const currentYear = date.year();

//   for (const [season, range] of Object.entries(seasons)) {
//     const startDate = dayjs(`${range.start}/${currentYear}`, "DD/MM/YYYY");
//     const endDate = dayjs(`${range.end}/${currentYear}`, "DD/MM/YYYY");

//     if (date.isAfter(startDate) && date.isBefore(endDate)) {
//       return season;
//     }
//   }

//   return "NoSeason";
// };
const getCurrentSeason = (date = dayjs()) => {
  const targetDate = dayjs(date);
  const currentYear = targetDate.year();

  for (const [season, range] of Object.entries(seasons)) {
    const startDate = dayjs(`${range.start}/${currentYear}`, "DD/MM/YYYY");
    const endDate = dayjs(`${range.end}/${currentYear}`, "DD/MM/YYYY");

    if (targetDate.isAfter(startDate) && targetDate.isBefore(endDate)) {
      return season;
    }
  }

  return "NoSeason"; // Default season
};

// const getCurrentSeason = () => {
//   const today = dayjs();
//   const currentYear = today.year();

//   for (const [season, range] of Object.entries(seasons)) {
//     const startDate = dayjs(`${range.start}/${currentYear}`, "DD/MM/YYYY");
//     const endDate = dayjs(`${range.end}/${currentYear}`, "DD/MM/YYYY");

//     if (today.isAfter(startDate) && today.isBefore(endDate)) {
//       return season;
//     }
//   }

//   return "NoSeason"; // Default season
// };

// PricingDisplay component to show current season pricing
// const PricingDisplay = ({ prices }) => {
//   const { t } = useTranslation();
//   const currentSeason = getCurrentSeason(); // Get current season
//   const pricingData = prices[currentSeason].days || {}; // Get the days and amounts for the current season
const PricingDisplay = ({ prices, selectedDate }) => {
  const { t } = useTranslation();
  const [discount, setDiscount] = useState(null);
  const [discountStart, setDiscountStart] = useState(null);
  const [discountEnd, setDiscountEnd] = useState(null);
  const seasonDate = selectedDate ? dayjs(selectedDate) : dayjs();
  const currentSeason = getCurrentSeason(seasonDate);
  const pricingData = prices[currentSeason]?.days || {};

  useEffect(() => {
    async function fetchDiscount() {
      try {
        const res = await fetch("/api/discount");
        if (!res.ok) throw new Error("Ошибка загрузки скидки");
        const data = await res.json();
        setDiscount(data.discount || null);
        setDiscountStart(data.startDate ? dayjs(data.startDate) : null);
        setDiscountEnd(data.endDate ? dayjs(data.endDate) : null);
      } catch (err) {
        console.error("Ошибка загрузки скидки:", err);
      }
    }
    fetchDiscount();
    console.log("Текущий сезон:", currentSeason);
  }, [selectedDate, currentSeason]);

  // Helper function для формирования шапки таблицы цен при аренде авто
  const getDayRangeText = (days) => {
    const daysNum = Number(days); // Явное преобразование в число
    //console.log("1. Читаем из Tiers:", days, daysNum);
    //if (daysNum >= 1 && daysNum <= 4) return t("carPark.1-4days");
    if (daysNum === 4) return t("carPark.1-4days");
    if (daysNum === 7) return t("carPark.5-14days");
    if (daysNum === 14) return t("carPark.14+days"); // Явное условие для >14

    return ""; // Запасной вариант
  };

  return (
    <>
      {" "}
      <Typography>
        {t("car.pricesFor")} - {currentSeason} ({t("basic.from")}{" "}
        {seasons[currentSeason].start} {t("basic.till")}{" "}
        {seasons[currentSeason].end})
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
          {Object.entries(pricingData).map(([days, amount], index) => {
            // Проверяем, действует ли скидка на выбранную дату
            let isDiscountActive = false;
            if (discount && discountStart && discountEnd) {
              const targetDate = selectedDate ? dayjs(selectedDate) : dayjs();
              isDiscountActive = targetDate.isSameOrAfter(discountStart, 'day') && targetDate.isSameOrBefore(discountEnd, 'day');
            }
            const discountedPrice = isDiscountActive ? Math.round(amount * (1 - discount / 100)) : amount;
            return (
              <React.Fragment key={index}>
                <Stack direction="column" alignItems="center">
                  <Typography
                    sx={{
                      lineHeight: { xs: "0.9rem", sm: "0.9rem" },
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      mb: 1,
                    }}
                  >
                    {getDayRangeText(days)}
                  </Typography>

                  <Typography
                    sx={{
                      lineHeight: { xs: "1rem", sm: "1.2rem" },
                      fontSize: { xs: "1rem", sm: "1.2rem" },
                    }}
                    color="primary"
                  >
                    {isDiscountActive ? (
                      <>
                        <span style={{ textDecoration: "line-through", color: "#888", marginRight: 6 }}>${amount}</span>
                        <span>${discountedPrice}</span>
                        <span style={{ color: "#388e3c", marginLeft: 4 }}>({discount}% скидка)</span>
                      </>
                    ) : (
                      <>${amount}</>
                    )}
                  </Typography>
                </Stack>

                {/* Divider between prices */}
                {index + 1 < Object.entries(pricingData).length && (
                  <Divider orientation="vertical" flexItem />
                )}
              </React.Fragment>
            );
          })}
        </Stack>
      </Paper>
    </>
  );
};

export default PricingDisplay;
