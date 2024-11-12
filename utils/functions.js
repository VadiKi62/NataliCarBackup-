import dayjs from "dayjs";

export const processOrders = (orders) => {
  const unavailableDates = [];
  const confirmedDates = [];

  orders.forEach((order) => {
    const startDate = dayjs(order.rentalStartDate);
    const endDate = dayjs(order.rentalEndDate);

    let currentDate = startDate;
    while (
      currentDate.isBefore(endDate) ||
      currentDate.isSame(endDate, "day")
    ) {
      const dateStr = currentDate.format("YYYY-MM-DD");
      unavailableDates.push(dateStr);
      if (order.confirmed) {
        confirmedDates.push(dateStr);
      }
      currentDate = currentDate.add(1, "day");
    }
  });

  return { unavailableDates, confirmedDates };
};

export const functionToCheckDuplicates = (
  conflictMessage1 = [],
  conflictMessage2 = [],
  conflictMessage3 = []
) => {
  const combinedSet = new Set([...conflictMessage1, ...conflictMessage2]);

  const filteredConflictMessage3 = conflictMessage3.filter(
    (message) => !combinedSet.has(message)
  );

  return filteredConflictMessage3;
};

export const functionToretunrStartEndOverlap = (startEnd) => {
  const startEndOverlap = [];

  startEnd.forEach((date) => {
    if (date.type === "start") {
      const overlappingEndDates = startEnd.filter(
        (d) => d.date === date.date && d.type === "end"
      );
      if (overlappingEndDates.length > 0) {
        startEndOverlap.push(date.date);
      }
    }
  });

  return startEndOverlap;
};

export function getConfirmedAndUnavailableStartEndDates(
  startEnd,
  confirmedDates,
  unavailableDates
) {
  const confirmedAndStartEnd = [];
  const unavailableAndStartEnd = [];

  startEnd.forEach((date) => {
    if (confirmedDates.includes(date.date)) {
      confirmedAndStartEnd.push(date.date);
    } else if (unavailableDates.includes(date.date)) {
      unavailableAndStartEnd.push(date.date);
    }
  });

  console.log(confirmedAndStartEnd);
  console.log(unavailableAndStartEnd);

  return {
    confirmedAndStartEnd,
    unavailableAndStartEnd,
  };
}
