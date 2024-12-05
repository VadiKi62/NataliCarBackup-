// "use client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
// import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
// import isSame from "dayjs/plugin/isSame";
import isBetween from "dayjs/plugin/isBetween";
import { companyData } from "@utils/companyData";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.tz.setDefault("Europe/Athens");

const defaultStartHour = companyData.defaultStart.slice(0, 2);
const defaultStartMinute = companyData.defaultStart.slice(-2);

const defaultEndHour = companyData.defaultEnd.slice(0, 2);
const defaultEndMinute = companyData.defaultEnd.slice(-2);

/**
 * Проверяет, относятся ли две даты к одному дню
 * @param {dayjs.Dayjs} date1
 * @param {dayjs.Dayjs} date2
 * @returns {boolean}
 */
const isSameDay = (date1, date2) => {
  return date1.format("YYYY-MM-DD") === date2.format("YYYY-MM-DD");
};

/**
 * Проверяет, меньше или равна ли первая дата второй
 * @param {dayjs.Dayjs} date1
 * @param {dayjs.Dayjs} date2
 * @returns {boolean}
 */
const isSameOrBefore = (date1, date2) => {
  return date1.format("YYYY-MM-DD") <= date2.format("YYYY-MM-DD");
};

/**
 * Анализирует массив заказов и возвращает даты с их статусами
 * @param {Array} orders - Массив заказов
 * @returns {Object} Объект с подтвержденными и ожидающими датами
 */

function analyzeDates(orders) {
  const result = {
    confirmed: [],
    pending: [],
  };

  // Создаем Map для отслеживания повторений дат
  const dateOccurrences = new Map();

  // Первый проход: собираем все даты и подсчитываем их повторения
  orders.forEach((order) => {
    const startDate = dayjs.utc(order.rentalStartDate).startOf("day");
    const endDate = dayjs.utc(order.rentalEndDate).startOf("day");
    let currentDate = startDate;

    while (isSameOrBefore(currentDate, endDate)) {
      const dateStr = currentDate.format("YYYY-MM-DD");
      const count = dateOccurrences.get(dateStr) || 0;
      dateOccurrences.set(dateStr, count + 1);
      currentDate = currentDate.add(1, "day");
    }
  });

  // Второй проход: формируем результат
  orders.forEach((order) => {
    const startDate = dayjs.utc(order.rentalStartDate).startOf("day");
    const endDate = dayjs.utc(order.rentalEndDate).startOf("day");
    let currentDate = startDate;

    while (isSameOrBefore(currentDate, endDate)) {
      const dateStr = currentDate.format("YYYY-MM-DD");
      const dateObj = {
        date: currentDate.toDate(),
        dateFormat: currentDate.format("YYYY-MM-DD"),
        datejs: currentDate,
        isStart: isSameDay(currentDate, startDate),
        isEnd: isSameDay(currentDate, endDate),
        timeStart: isSameDay(currentDate, startDate) ? order.timeIn : null,
        timeEnd: isSameDay(currentDate, endDate) ? order.timeOut : null,
        isOverlapped: dateOccurrences.get(dateStr) - 1,
        orderId: order._id,
      };

      if (order.confirmed) {
        const existingIndex = result.confirmed.findIndex((item) =>
          isSameDay(dayjs(item.date), currentDate)
        );

        if (existingIndex === -1) {
          result.confirmed.push(dateObj);
        }
      } else {
        const existingIndex = result.pending.findIndex((item) =>
          isSameDay(dayjs(item.date), currentDate)
        );

        if (existingIndex === -1) {
          result.pending.push(dateObj);
        }
      }

      currentDate = currentDate.add(1, "day");
    }
  });

  // Сортируем даты
  result.confirmed.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
  result.pending.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

  return result;
}

function functionPendingDatesInRange(pending, start, end) {
  console.log("pending", pending);
  return pending?.filter((bookingDate) => {
    const currentDate = dayjs(bookingDate.date);

    const startDate = dayjs(start);
    const endDate = dayjs(end);

    // Проверяем, равна ли дата текущей дате (start или end)
    const isStartDate = isSameDay(startDate, currentDate);

    const isEndDate = isSameDay(endDate, currentDate);

    // Проверка на то, что дата находится в диапазоне
    const isWithinRange =
      currentDate.isAfter(startDate) && currentDate.isBefore(endDate);
    // const isSameOrBeforeEnd =
    //   currentDate.isBefore(endDate) || currentDate.isSame(endDate, "day");

    // Возвращаем те даты, которые равны start или end, и находятся в пределах диапазона
    return isStartDate || isEndDate || isWithinRange;
  });
}

// пушает фремя в существующий datejs обьект
function setTimeToDatejs(date, time, isStart = false) {
  // console.log("DATE", date);
  // console.log("time", time);
  if (time) {
    const hour = Number(time?.slice(0, 2));
    const minute = Number(time?.slice(-2));
    const newDateWithTime = dayjs(date).hour(hour).minute(minute);

    return newDateWithTime;
  } else if (isStart) {
    // console.log("???? day to retunr for START", dayjs(date).hour(15).minute(0));
    return dayjs(date).hour(defaultStartHour).minute(defaultStartMinute);
  } else return dayjs(date).hour(defaultEndHour).minute(defaultEndMinute);
}

module.exports = {
  analyzeDates,
  functionPendingDatesInRange,
  isSameOrBefore,
  isSameDay,
  setTimeToDatejs,
};
