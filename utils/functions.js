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

// эта функция возвращает все подтвержденные и неподтвержденные даты бронирования а также их начальные и финальные дни НЕ РАБОТАЕТ ПОКА
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

  return {
    confirmedAndStartEnd,
    unavailableAndStartEnd,
  };
}

// ЄТА ФУНКЦИЯ ВОЗВРАЩАЕТ ТОЛЬКО ТЕ ДНИ, В КОТОРЫЕ ПЕРЕСЕЧЕНИЕ НАЧАЛА ОЖНОГО БРОНИРОВАНИЯ И КОНЦА ДРУГОГО БРОНИРОВАНИЯ
// ДОРАБОТАТЬ : ЧТОБЫ ФУНКЦИЯ ВОЗРАЩАЛА ТАКЖЕ ОБЬЕКТ  C ЭТИМИ ДВУМЯ ДАТАМИ И С обозначение старт или енд каждой из них

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

// функция которая возвращает 4 массива - 1. только старт и енд даты (внутри они обьекты, чтобы выделить отдельно подтвержденные и неподтвержденные) 2. только подтвержденные внутренние даты 3. только неподтвержденные внутренние даты 4. только те стартовые и конечные даты, которые случаются в одни дни

export function extractArraysOfStartEndConfPending(orders) {
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

  // Transform startEnd into the required structure
  const transformedStartEndOverlap = startEnd
    .reduce((acc, date) => {
      // Найти запись для текущей даты
      let entry = acc.find((item) => item.date === date.date);

      if (!entry) {
        // Создаем новую запись, если ее еще нет
        entry = {
          date: date.date,
          startConfirmed: false,
          startPending: false,
          endConfirmed: false,
          endPending: false,
          startExists: false, // Для проверки наличия типа "start"
          endExists: false, // Для проверки наличия типа "end"
        };
        acc.push(entry);
      }

      // Обновляем статус на основе типа и подтверждения
      if (date.type === "start") {
        if (date.confirmed) {
          entry.startConfirmed = true;
        } else {
          entry.startPending = true;
        }
        entry.startExists = true;
      } else if (date.type === "end") {
        if (date.confirmed) {
          entry.endConfirmed = true;
        } else {
          entry.endPending = true;
        }
        entry.endExists = true;
      }

      // console.log("ENTRY of dates in reduce function", entry);

      return acc;
    }, [])
    // Фильтруем, чтобы оставить только те даты, где есть и "start", и "end"
    .filter((entry) => entry.startExists && entry.endExists)
    .reduce((acc, cur) => {
      acc.push({
        date: cur.date,
        startConfirmed: cur.startConfirmed,
        endConfirmed: cur.endConfirmed,
        startPending: cur.startPending,
        endPending: cur.endPending,
      });
      return acc;
    }, []);

  return {
    unavailable,
    confirmed,
    startEnd,
    transformedStartEndOverlap,
  };
}

export function returnOverlapOrders(orders, dateStr) {
  let overlapOrders = [];
  orders.forEach((order) => {
    const rentalStart = dayjs(order.rentalStartDate).format("YYYY-MM-DD");
    const rentalEnd = dayjs(order.rentalEndDate).format("YYYY-MM-DD");

    if (dayjs(dateStr).isBetween(rentalStart, rentalEnd, "day", "[]")) {
      overlapOrders.push(order);
    }
  });

  return overlapOrders;
}

export function returnOverlapOrdersObjects(
  orders,
  transformedStartEndOverlap = []
) {
  // Создаем Map для отслеживания повторений дат
  const dateOccurrences = new Map();

  // Первый проход: собираем все даты и подсчитываем их повторения
  orders.forEach((order) => {
    const rentalStart = dayjs(order.rentalStartDate);
    const rentalEnd = dayjs(order.rentalEndDate);
    let currentDate = rentalStart;

    while (currentDate.isBetween(rentalStart, rentalEnd, "day", "[]")) {
      const dateStr = currentDate.format("YYYY-MM-DD");

      // Получаем или инициализируем объект для этой даты
      const counts = dateOccurrences.get(dateStr) || {
        confirmed: 0,
        pending: 0,
      };

      // Увеличиваем соответствующий счетчик
      if (order.confirmed) {
        counts.confirmed += 1;
      } else {
        counts.pending += 1;
      }

      // Обновляем Map
      dateOccurrences.set(dateStr, counts);

      // Переходим к следующему дню
      currentDate = currentDate.add(1, "day");
    }
  });

  // Преобразуем Map в массив объектов
  const result = Array.from(dateOccurrences.entries())
    .map(([date, counts]) => ({
      date,
      ...counts,
    }))
    .filter(
      ({ confirmed, pending }) =>
        (confirmed > 0 && pending > 0) || confirmed > 1 || pending > 1
    ) // Дополнительный фильтр для исключения дат из transformedStartEndOverlap
    .filter(
      ({ date }) =>
        !transformedStartEndOverlap?.some((overlap) => overlap.date === date)
    );

  return result;
}
