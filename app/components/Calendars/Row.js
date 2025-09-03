"use client";
import React, { useState, useEffect, useCallback } from "react";
import { TableCell, Box } from "@mui/material";
import dayjs from "dayjs";
import { useMainContext } from "@app/Context";
import {
  extractArraysOfStartEndConfPending,
  returnOverlapOrders,
  returnOverlapOrdersObjects,
} from "@utils/functions";
import PropTypes from "prop-types";
import { useSnackbar } from "notistack";

CarTableRow.propTypes = {
  car: PropTypes.object.isRequired,
  days: PropTypes.array.isRequired,
  orders: PropTypes.array,
  setSelectedOrders: PropTypes.func,
  setOpen: PropTypes.func,
  onAddOrderClick: PropTypes.func,
  onLongPress: PropTypes.func.isRequired,
  moveMode: PropTypes.bool,
  onCarSelectForMove: PropTypes.func,
  selectedOrderId: PropTypes.string,
  orderToMove: PropTypes.object,
  selectedMoveOrder: PropTypes.object,
  onExitMoveMode: PropTypes.func,
  selectedOrderDates: PropTypes.array,
  isCarCompatibleForMove: PropTypes.bool,
};

export default function CarTableRow({
  car,
  days,
  orders,
  setSelectedOrders,
  setOpen,
  onAddOrderClick,
  onLongPress,
  moveMode,
  onCarSelectForMove,
  selectedMoveOrder,
  orderToMove,
  onExitMoveMode,
  selectedOrderDates,
  isCarCompatibleForMove,
}) {
  const [pressTimer, setPressTimer] = useState(null);
  const [isPressing, setIsPressing] = useState(false);
  const [longPressOrder, setLongPressOrder] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const { ordersByCarId } = useMainContext();
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [confirmedDates, setConfirmedDates] = useState([]);
  const [startEndOverlapDates, setStartEndOverlapDates] = useState(null);
  const [overlapDates, setOverlapDates] = useState(null);
  const [startEndDates, setStartEndDates] = useState([]);
  const [carOrders, setCarOrders] = useState(orders);

  const [wasLongPress, setWasLongPress] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  // Отслеживаем изменения selectedMoveOrder для подсветки
  useEffect(() => {
    if (selectedMoveOrder) {
      setSelectedOrderId(selectedMoveOrder._id);
    } else {
      setSelectedOrderId(null);
    }
  }, [selectedMoveOrder]);

  useEffect(() => {
    const updatedOrders = ordersByCarId(car._id);
    setCarOrders(updatedOrders);
  }, [car._id, ordersByCarId]);

  useEffect(() => {
    const { unavailable, confirmed, startEnd, transformedStartEndOverlap } =
      extractArraysOfStartEndConfPending(carOrders);

    const overlap = returnOverlapOrdersObjects(
      carOrders,
      transformedStartEndOverlap
    );
    setOverlapDates(overlap);
    setStartEndOverlapDates(transformedStartEndOverlap);
    setUnavailableDates(unavailable);
    setConfirmedDates(confirmed);
    setStartEndDates(startEnd);
  }, [carOrders]);

  // Функция для получения заказа по дате
  const getOrderByDate = useCallback(
    (dateStr) => {
      return carOrders.find((order) => {
        const rentalStart = dayjs(order.rentalStartDate).format("YYYY-MM-DD");
        const rentalEnd = dayjs(order.rentalEndDate).format("YYYY-MM-DD");
        return dayjs(dateStr).isBetween(rentalStart, rentalEnd, "day", "[]");
      });
    },
    [carOrders]
  );

  // Функция для проверки, является ли дата частью выбранного заказа (для синей подсветки)
  const isPartOfSelectedOrder = useCallback(
    (dateStr) => {
      if (!selectedOrderId) return false;
      const order = carOrders.find((o) => o._id === selectedOrderId);
      if (!order) return false;

      const rentalStart = dayjs(order.rentalStartDate).format("YYYY-MM-DD");
      const rentalEnd = dayjs(order.rentalEndDate).format("YYYY-MM-DD");
      return dayjs(dateStr).isBetween(rentalStart, rentalEnd, "day", "[]");
    },
    [selectedOrderId, carOrders]
  );

  // Функция для проверки, является ли дата последней для заказа
  const isLastDateForOrder = useCallback(
    (dateStr) => {
      const relevantOrders = carOrders.filter((order) => {
        const rentalStart = dayjs(order.rentalStartDate).format("YYYY-MM-DD");
        const rentalEnd = dayjs(order.rentalEndDate).format("YYYY-MM-DD");
        return dayjs(dateStr).isBetween(rentalStart, rentalEnd, "day", "[]");
      });

      return relevantOrders.some((order) => {
        const rentalEnd = dayjs(order.rentalEndDate).format("YYYY-MM-DD");
        return rentalEnd === dateStr;
      });
    },
    [carOrders]
  );

  // Функция для проверки, содержит ли ячейка заказ
  const hasOrder = useCallback(
    (dateStr) => {
      const isConfirmed = confirmedDates.includes(dateStr);
      const isUnavailable = unavailableDates.includes(dateStr);
      const startEndInfo = startEndDates.find((d) => d.date === dateStr);
      const isStartDate = startEndInfo?.type === "start";
      const isEndDate = startEndInfo?.type === "end";
      const isStartAndEndDateOverlapInfo = startEndOverlapDates?.find(
        (dateObj) => dateObj.date === dateStr
      );
      const isStartEndOverlap = Boolean(isStartAndEndDateOverlapInfo);
      const isOverlapDateInfo = overlapDates?.find(
        (dateObj) => dateObj.date === dateStr
      );
      const isOverlapDate = Boolean(isOverlapDateInfo);

      return (
        isConfirmed ||
        isUnavailable ||
        isOverlapDate ||
        isStartEndOverlap ||
        isStartDate ||
        isEndDate
      );
    },
    [
      confirmedDates,
      unavailableDates,
      startEndDates,
      startEndOverlapDates,
      overlapDates,
    ]
  );

  // ИСПРАВЛЕННЫЕ обработчики для длинного нажатия
  const handleLongPressStart = (dateStr) => {
    // Запрещаем длинное нажатие, если уже активен режим перемещения
    if (moveMode) {
      return;
    }

    if (hasOrder(dateStr) && !isLastDateForOrder(dateStr)) {
      setWasLongPress(false); // Сбрасываем флаг

      const timer = setTimeout(() => {
        const order = getOrderByDate(dateStr);
        if (order) {
          setWasLongPress(true); // Устанавливаем флаг длинного нажатия
          console.log("Long press detected on order:", {
            id: order._id,
            customer: order.customerName,
            carId: order.car,
            dates: order.rentalStartDate + " - " + order.rentalEndDate,
          });

          // Выделяем заказ синим цветом
          setSelectedOrderId(order._id);

          // Вызываем функцию длинного нажатия (активирует режим перемещения)
          if (onLongPress) {
            onLongPress(order);
          }
        }
      }, 500); // 500ms для длинного нажатия

      setPressTimer(timer);
    }
  };

  const handleLongPressEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const renderDateCell = useCallback(
    (date) => {
      const dateStr = date.format("YYYY-MM-DD");

      // Функция для создания желтого overlay для первого/последнего дня перемещения
      const createYellowOverlay = (isFirstDay, isLastDay) => {
        console.log(
          "🟡 createYellowOverlay:",
          shouldShowYellowOverlay,
          isFirstDay,
          isLastDay
        );

        if (!shouldShowYellowOverlay) return null;

        console.log("✅ Создаем желтый overlay для", dateStr);

        if (isFirstDay && isLastDay) {
          // Если это единственный день заказа
          return (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 243, 205, 0.6)", // Полупрозрачный желтый
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
          );
        } else if (isFirstDay) {
          // Правая половина для первого дня
          return (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "50%",
                height: "100%",
                backgroundColor: "rgba(255, 243, 205, 0.6)",
                pointerEvents: "none",
                zIndex: 1,
                borderRadius: "50% 0 0 50%",
              }}
            />
          );
        } else if (isLastDay) {
          // Левая половина для последнего дня
          return (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "50%",
                height: "100%",
                backgroundColor: "rgba(255, 243, 205, 0.6)",
                pointerEvents: "none",
                zIndex: 1,
                borderRadius: "0 50% 50% 0",
              }}
            />
          );
        }
        return null;
      };

      const isConfirmed = confirmedDates.includes(dateStr);
      const isUnavailable = unavailableDates.includes(dateStr);

      const startEndInfo = startEndDates.find((d) => d.date === dateStr);
      const isStartDate = startEndInfo?.type === "start";
      const isEndDate = startEndInfo?.type === "end";
      const isStartAndEndDateOverlapInfo = startEndOverlapDates?.find(
        (dateObj) => dateObj.date === dateStr
      );
      const isStartEndOverlap = Boolean(isStartAndEndDateOverlapInfo);

      const overlapOrders = returnOverlapOrders(carOrders, dateStr);
      const isOverlapDateInfo = overlapDates?.find(
        (dateObj) => dateObj.date === dateStr
      );
      const isOverlapDate = Boolean(isOverlapDateInfo);

      let backgroundColor = "transparent";
      let color = "inherit";
      let borderRadius = "1px";
      let border = "1px solid green";
      let width;

      // Базовая логика определения цвета
      if (isUnavailable) {
        backgroundColor = "primary.green";
        color = "text.dark";
      }
      if (isConfirmed) {
        backgroundColor = "primary.red";
        color = "common.white";
      }

      // Желтый фон для режима перемещения - применяется только к совместимым автомобилям
      let isInMoveModeDateRange = false;
      let gradientBackground = null;
      let shouldShowYellowOverlay = false;
      let isFirstMoveDay = false;
      let isLastMoveDay = false;

      if (
        moveMode &&
        selectedOrderDates &&
        selectedOrderDates.includes(dateStr) &&
        isCarCompatibleForMove
      ) {
        console.log(
          `🟡 Режим перемещения для ${dateStr}, фон: ${backgroundColor}`
        );

        isFirstMoveDay = selectedOrderDates[0] === dateStr;
        isLastMoveDay =
          selectedOrderDates[selectedOrderDates.length - 1] === dateStr;

        // Применяем желтый фон для пустых ячеек и совместимых автомобилей
        if (backgroundColor === "transparent") {
          console.log(`📅 Пустая ячейка ${dateStr} - применяем градиент`);
          if (isFirstMoveDay) {
            // Желтый фон в правой половине первого дня
            gradientBackground =
              "linear-gradient(to right, transparent 50%, #fff3cd 50%)";
          } else if (isLastMoveDay) {
            // Желтый фон в левой половине последнего дня
            gradientBackground =
              "linear-gradient(to right, #fff3cd 50%, transparent 50%)";
          } else {
            // Полный желтый фон для средних дней
            backgroundColor = "#fff3cd";
          }
          isInMoveModeDateRange = true;
        } else {
          // Для занятых ячеек в первый и последний дни показываем желтый overlay
          if (isFirstMoveDay || isLastMoveDay) {
            console.log(`🟨 Занятая ячейка ${dateStr} - устанавливаем overlay`);
            shouldShowYellowOverlay = true;
            isInMoveModeDateRange = true;
          }
        }
      }

      // ВАЖНО: Проверка выделения должна быть в самом конце для перезаписи цвета
      // НО не должна перезаписывать желтый фон для режима перемещения
      if (isPartOfSelectedOrder(dateStr) && !isInMoveModeDateRange) {
        // Проверяем edge-case для императивной логики
        let shouldApplyImperativeBlue = true;
        if (selectedOrderId) {
          const selectedOrder = carOrders.find(
            (o) => o._id === selectedOrderId
          );
          if (selectedOrder) {
            const selectedOrderStart = dayjs(
              selectedOrder.rentalStartDate
            ).format("YYYY-MM-DD");
            const selectedOrderEnd = dayjs(selectedOrder.rentalEndDate).format(
              "YYYY-MM-DD"
            );

            const previousOrder = carOrders.find((o) => {
              const rentalEnd = dayjs(o.rentalEndDate).format("YYYY-MM-DD");
              return rentalEnd === dateStr && o._id !== selectedOrderId;
            });

            const nextOrder = carOrders.find((o) => {
              const rentalStart = dayjs(o.rentalStartDate).format("YYYY-MM-DD");
              return rentalStart === dateStr && o._id !== selectedOrderId;
            });

            // Если это edge-case (первый день выбранного заказа + есть предыдущий заказ), не применяем императивную подсветку
            if (selectedOrderStart === dateStr && previousOrder) {
              shouldApplyImperativeBlue = false;
            }

            // Если это edge-case (последний день выбранного заказа + есть следующий заказ), не применяем императивную подсветку
            if (selectedOrderEnd === dateStr && nextOrder) {
              shouldApplyImperativeBlue = false;
            }
          }
        }

        if (shouldApplyImperativeBlue) {
          backgroundColor = "#1976d2"; // Синий цвет для выбранного заказа
          color = "white";
        }
      }

      if (isStartDate && !isEndDate) {
        borderRadius = "50% 0 0 50%";
        width = "50%";
        if (!isPartOfSelectedOrder(dateStr) && !isInMoveModeDateRange) {
          backgroundColor = "primary.green";
          color = "common.white";
        }
      }
      if (!isStartDate && isEndDate) {
        borderRadius = "0 50% 50% 0";
        width = "50%";

        // Проверяем edge-case для императивной логики
        let shouldApplyBlueBackground = false;
        if (selectedOrderId) {
          const selectedOrder = carOrders.find(
            (o) => o._id === selectedOrderId
          );
          if (selectedOrder) {
            const selectedOrderStart = dayjs(
              selectedOrder.rentalStartDate
            ).format("YYYY-MM-DD");
            const selectedOrderEnd = dayjs(selectedOrder.rentalEndDate).format(
              "YYYY-MM-DD"
            );

            const previousOrder = carOrders.find((o) => {
              const rentalEnd = dayjs(o.rentalEndDate).format("YYYY-MM-DD");
              return rentalEnd === dateStr && o._id !== selectedOrderId;
            });

            const nextOrder = carOrders.find((o) => {
              const rentalStart = dayjs(o.rentalStartDate).format("YYYY-MM-DD");
              return rentalStart === dateStr && o._id !== selectedOrderId;
            });

            // Если это НЕ edge-case, применяем обычную логику
            if (
              !(selectedOrderStart === dateStr && previousOrder) &&
              !(selectedOrderEnd === dateStr && nextOrder) &&
              isPartOfSelectedOrder(dateStr)
            ) {
              shouldApplyBlueBackground = true;
            }
          }
        } else if (isPartOfSelectedOrder(dateStr)) {
          shouldApplyBlueBackground = true;
        }

        if (!shouldApplyBlueBackground && !isInMoveModeDateRange) {
          backgroundColor = "primary.green";
          color = "common.white";
        }
      }

      // ИСПРАВЛЕННАЯ функция обработки клика по дате с заказом
      const handleDateClick = () => {
        // Если это было длинное нажатие, не открываем модальное окно
        if (wasLongPress) {
          setWasLongPress(false); // Сбрасываем флаг
          return;
        }

        // Если в режиме перемещения
        if (moveMode) {
          // Проверяем, кликнули ли мы по выбранному для перемещения заказу (синяя ячейка)
          if (selectedMoveOrder) {
            const relevantOrders = carOrders.filter((order) => {
              const rentalStart = dayjs(order.rentalStartDate).format(
                "YYYY-MM-DD"
              );
              const rentalEnd = dayjs(order.rentalEndDate).format("YYYY-MM-DD");
              return dayjs(dateStr).isBetween(
                rentalStart,
                rentalEnd,
                "day",
                "[]"
              );
            });

            // Если среди заказов на этой дате есть выбранный для перемещения заказ
            const isClickOnSelectedOrder = relevantOrders.some(
              (order) => order._id === selectedMoveOrder._id
            );

            if (isClickOnSelectedOrder) {
              // Выходим из режима перемещения
              if (onExitMoveMode) {
                onExitMoveMode();
              }
              return;
            }
          }
          // Если кликнули не на выбранный заказ (синюю ячейку), блокируем клик
          return;
        }

        const relevantOrders = carOrders.filter((order) => {
          const rentalStart = dayjs(order.rentalStartDate).format("YYYY-MM-DD");
          const rentalEnd = dayjs(order.rentalEndDate).format("YYYY-MM-DD");
          return dayjs(dateStr).isBetween(rentalStart, rentalEnd, "day", "[]");
        });

        if (relevantOrders.length > 0) {
          setSelectedOrders(relevantOrders);
          setOpen(true);
        }
      };

      const isCellEmpty =
        !isConfirmed &&
        !isUnavailable &&
        !isOverlapDate &&
        !isStartEndOverlap &&
        !isStartDate &&
        !isEndDate;

      // ИСПРАВЛЕННАЯ функция обработки клика по пустой ячейке
      const handleEmptyCellClick = () => {
        console.log("Empty cell click - moveMode:", moveMode, "car:", car);

        // Если в режиме перемещения
        if (moveMode) {
          // Проверяем, что это желтая ячейка (совместимый автомобиль и дата в диапазоне)
          const isInYellowRange =
            selectedOrderDates &&
            selectedOrderDates.includes(dateStr) &&
            isCarCompatibleForMove;

          if (!isInYellowRange) {
            // Если это не желтая ячейка, блокируем клик
            return;
          }

          console.log("=== Режим перемещения активен ===");
          console.log("Выбранный заказ для перемещения:", selectedMoveOrder);
          console.log("Целевой автомобиль:", {
            id: car._id,
            number: car.carNumber,
            model: car.model,
          });

          // Проверяем, что есть заказ для перемещения
          if (!selectedMoveOrder) {
            console.error("Ошибка: не выбран заказ для перемещения");
            return;
          }

          // Проверяем, что не пытаемся переместить на тот же автомобиль
          if (selectedMoveOrder.car === car._id) {
            console.log("Попытка переместить на тот же автомобиль");
            return;
          }

          // Проверка на конфликт времени
          const ordersAtTargetCar = ordersByCarId(car._id);
          const start = dayjs(selectedMoveOrder.rentalStartDate);
          const end = dayjs(selectedMoveOrder.rentalEndDate);

          const conflict = ordersAtTargetCar.some((order) => {
            const otherStart = dayjs(order.rentalStartDate);
            const otherEnd = dayjs(order.rentalEndDate);

            const overlap =
              (start.isBefore(otherEnd) && end.isAfter(otherStart)) ||
              start.isSame(otherStart) ||
              end.isSame(otherEnd);

            return overlap && order._id !== selectedMoveOrder._id;
          });

          if (conflict) {
            enqueueSnackbar("⛔ Перемещение отменено: конфликт по времени", {
              variant: "error",
            });
            return;
          }

          // Вызываем функцию выбора автомобиля для перемещения
          if (onCarSelectForMove) {
            onCarSelectForMove({
              _id: car._id,
              carNumber: car.carNumber,
              model: car.model,
              regNumber: car.regNumber,
            });
          }
          return;
        }

        // Обычный режим - создание нового заказа
        if (onAddOrderClick) {
          console.log("Создание нового заказа на", {
            car: car._id,
            date: dateStr,
          });
          onAddOrderClick(car, dateStr);
        }
      };

      if (isCellEmpty) {
        // Используем уже определенные переменные isFirstMoveDay и isLastMoveDay

        // Если это первый день диапазона перемещения - правый желтый полукруг только для совместимых автомобилей
        if (isFirstMoveDay && isCarCompatibleForMove) {
          return (
            <Box
              onClick={handleEmptyCellClick}
              onMouseDown={() => handleLongPressStart(dateStr)}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
              onContextMenu={(e) => e.preventDefault()}
              title="Нажмите для перемещения заказа"
              sx={{
                border: border,
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "row",
                cursor: "pointer",
                overflow: "hidden",
              }}
            >
              <Box sx={{ width: "50%", height: "100%" }}></Box>
              <Box
                sx={{
                  width: "50%",
                  height: "100%",
                  backgroundColor: "#fff3cd",
                  borderRadius: "50% 0 0 50%",
                }}
              ></Box>
            </Box>
          );
        }

        // Если это последний день диапазона перемещения - левый желтый полукруг только для совместимых автомобилей
        if (isLastMoveDay && isCarCompatibleForMove) {
          return (
            <Box
              onClick={handleEmptyCellClick}
              onMouseDown={() => handleLongPressStart(dateStr)}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
              onContextMenu={(e) => e.preventDefault()}
              title="Нажмите для перемещения заказа"
              sx={{
                border: border,
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "row",
                cursor: "pointer",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: "50%",
                  height: "100%",
                  backgroundColor: "#fff3cd",
                  borderRadius: "0 50% 50% 0",
                }}
              ></Box>
              <Box sx={{ width: "50%", height: "100%" }}></Box>
            </Box>
          );
        }

        return (
          <Box
            onClick={handleEmptyCellClick}
            onMouseDown={() => handleLongPressStart(dateStr)}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onContextMenu={(e) => e.preventDefault()}
            title={
              moveMode && isInMoveModeDateRange
                ? "Нажмите для перемещения заказа"
                : !moveMode
                ? "Нажмите для создания нового заказа"
                : undefined
            }
            sx={{
              position: "relative",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: gradientBackground || undefined,
              backgroundColor: !gradientBackground
                ? backgroundColor.startsWith("#")
                  ? backgroundColor
                  : backgroundColor
                : undefined,
              borderRadius,
              color,
              cursor:
                moveMode && !isInMoveModeDateRange ? "not-allowed" : "pointer",
              border: border,
              width: "100%",
            }}
          ></Box>
        );
      }

      if (isOverlapDate && !isStartEndOverlap) {
        const circlesPending = isOverlapDateInfo.pending || 0;
        const circlesConfirmed = isOverlapDateInfo.confirmed || 0;

        return (
          <Box
            onClick={handleDateClick}
            onMouseDown={() => handleLongPressStart(dateStr)}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onContextMenu={(e) => e.preventDefault()}
            title={
              isPartOfSelectedOrder(dateStr)
                ? "Нажмите для выхода из режима перемещения"
                : !moveMode
                ? "Длинное нажатие для режима перемещения заказа, обычный клик для просмотра всех заказов"
                : undefined
            }
            sx={{
              border: border,
              position: "relative",
              height: "120%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isPartOfSelectedOrder(dateStr)
                ? "common.white"
                : "text.red",
              backgroundColor: isPartOfSelectedOrder(dateStr)
                ? "#1976d2"
                : "text.green",
              cursor:
                moveMode && !isPartOfSelectedOrder(dateStr)
                  ? "not-allowed"
                  : "pointer",
              width: "100%",
            }}
          >
            {/* Желтый overlay для первого/последнего дня перемещения */}
            {createYellowOverlay(isFirstMoveDay, isLastMoveDay)}

            <Box
              sx={{
                position: "absolute",
                top: 2,
                display: "flex",
                gap: 1,
                justifyContent: "flex-end",
                width: "100%",
              }}
            >
              {Array.from({ length: circlesConfirmed }).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 6,
                    height: 6,
                    backgroundColor: "primary.red",
                    borderRadius: "50%",
                  }}
                />
              ))}
            </Box>
            <Box
              sx={{
                position: "absolute",
                top: 2,
                display: "flex",
                gap: 1,
                justifyContent: "center",
                width: "100%",
              }}
            >
              {Array.from({ length: circlesPending }).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 6,
                    height: 6,
                    backgroundColor: "primary.green",
                    borderRadius: "50%",
                  }}
                />
              ))}
            </Box>
          </Box>
        );
      }

      if (isStartEndOverlap) {
        // Проверяем edge-case для overlap случая
        let shouldHighlightLeft = false;
        let shouldHighlightRight = false;

        // Проверяем, является ли это первым или последним днем диапазона перемещения
        const isFirstMoveDay =
          moveMode && selectedOrderDates && selectedOrderDates[0] === dateStr;
        const isLastMoveDay =
          moveMode &&
          selectedOrderDates &&
          selectedOrderDates[selectedOrderDates.length - 1] === dateStr;
        // Для первого и последнего дня показываем желтый полукруг только для совместимых автомобилей
        const shouldShowFirstMoveDay = isFirstMoveDay && isCarCompatibleForMove;
        const shouldShowLastMoveDay = isLastMoveDay && isCarCompatibleForMove;

        if (selectedOrderId) {
          const selectedOrder = carOrders.find(
            (o) => o._id === selectedOrderId
          );
          if (selectedOrder) {
            // Логирование для отладки
            const selectedOrderStart = dayjs(
              selectedOrder.rentalStartDate
            ).format("YYYY-MM-DD");
            const selectedOrderEnd = dayjs(selectedOrder.rentalEndDate).format(
              "YYYY-MM-DD"
            );

            const previousOrder = carOrders.find((o) => {
              const rentalEnd = dayjs(o.rentalEndDate).format("YYYY-MM-DD");
              return rentalEnd === dateStr && o._id !== selectedOrderId;
            });

            const nextOrder = carOrders.find((o) => {
              const rentalStart = dayjs(o.rentalStartDate).format("YYYY-MM-DD");
              return rentalStart === dateStr && o._id !== selectedOrderId;
            });

            // Если это edge-case (первый день выбранного заказа + есть предыдущий заказ)
            if (selectedOrderStart === dateStr && previousOrder) {
              shouldHighlightLeft = false; // не подсвечивать левую половину (предыдущий заказ)
              shouldHighlightRight = true; // подсвечивать правую половину (выбранный заказ)
            }
            // Если это edge-case (последний день выбранного заказа + есть следующий заказ)
            else if (selectedOrderEnd === dateStr && nextOrder) {
              shouldHighlightLeft = true; // подсвечивать левую половину (выбранный заказ)
              shouldHighlightRight = false; // не подсвечивать правую половину (следующий заказ)
            } else if (isPartOfSelectedOrder(dateStr)) {
              shouldHighlightLeft = true; // обычная подсветка
              shouldHighlightRight = true; // обычная подсветка
            }
          }
        } else if (isPartOfSelectedOrder(dateStr)) {
          shouldHighlightLeft = true; // обычная подсветка
          shouldHighlightRight = true; // обычная подсветка
        }

        const isActiveInMoveMode =
          shouldShowFirstMoveDay ||
          shouldShowLastMoveDay ||
          isPartOfSelectedOrder(dateStr);

        return (
          <Box
            onClick={handleDateClick}
            onMouseDown={() => handleLongPressStart(dateStr)}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onContextMenu={(e) => e.preventDefault()}
            title={
              shouldShowFirstMoveDay || shouldShowLastMoveDay
                ? "Нажмите для перемещения заказа"
                : isPartOfSelectedOrder(dateStr)
                ? "Нажмите для выхода из режима перемещения"
                : !moveMode
                ? "Длинное нажатие для режима перемещения заказа, обычный клик для просмотра и редактирования заказов"
                : undefined
            }
            sx={{
              border: border,
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "row",
              cursor:
                moveMode && !isActiveInMoveMode ? "not-allowed" : "pointer",
            }}
          >
            {/* Желтый overlay для первого/последнего дня перемещения */}
            {createYellowOverlay(isFirstMoveDay, isLastMoveDay)}

            <Box
              sx={{
                width: "50%",
                height: "100%",
                backgroundColor: shouldShowLastMoveDay
                  ? "#fff3cd"
                  : shouldHighlightLeft
                  ? "#1976d2"
                  : isStartAndEndDateOverlapInfo.endConfirmed
                  ? "primary.main"
                  : "primary.green",
                borderRadius: "0 50% 50% 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
              }}
            ></Box>
            <Box
              sx={{
                width: "50%",
                height: "100%",
                backgroundColor: shouldShowFirstMoveDay
                  ? "#fff3cd"
                  : shouldHighlightRight
                  ? "#1976d2"
                  : isStartAndEndDateOverlapInfo.startConfirmed
                  ? "primary.main"
                  : "primary.green",
                borderRadius: "50% 0 0 50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
              }}
            ></Box>
          </Box>
        );
      }

      if (isStartDate && !isEndDate && !isOverlapDate) {
        // Проверяем edge-case для первого дня заказа
        let shouldHighlightRight = false;

        // Проверяем, является ли это первым днем диапазона перемещения
        const isFirstMoveDay =
          moveMode && selectedOrderDates && selectedOrderDates[0] === dateStr;
        // Для первого дня показываем желтый полукруг только для совместимых автомобилей
        const shouldShowFirstMoveDay = isFirstMoveDay && isCarCompatibleForMove;

        if (selectedOrderId) {
          const selectedOrder = carOrders.find(
            (o) => o._id === selectedOrderId
          );
          if (selectedOrder) {
            const selectedOrderStart = dayjs(
              selectedOrder.rentalStartDate
            ).format("YYYY-MM-DD");
            const selectedOrderEnd = dayjs(selectedOrder.rentalEndDate).format(
              "YYYY-MM-DD"
            );

            const previousOrder = carOrders.find((o) => {
              const rentalEnd = dayjs(o.rentalEndDate).format("YYYY-MM-DD");
              return rentalEnd === dateStr && o._id !== selectedOrderId;
            });

            const nextOrder = carOrders.find((o) => {
              const rentalStart = dayjs(o.rentalStartDate).format("YYYY-MM-DD");
              return rentalStart === dateStr && o._id !== selectedOrderId;
            });

            // Если это edge-case (первый день выбранного заказа + есть предыдущий заказ)
            if (selectedOrderStart === dateStr && previousOrder) {
              shouldHighlightRight = true; // подсвечивать правую половину (выбранный заказ)
            }
            // Если это edge-case (последний день выбранного заказа + есть следующий заказ)
            else if (selectedOrderEnd === dateStr && nextOrder) {
              shouldHighlightRight = false; // не подсвечивать правую половину (следующий заказ)
            } else if (isPartOfSelectedOrder(dateStr)) {
              shouldHighlightRight = true; // обычная подсветка
            }
          }
        } else if (isPartOfSelectedOrder(dateStr)) {
          shouldHighlightRight = true; // обычная подсветка
        }

        const isActiveInMoveMode =
          shouldShowFirstMoveDay || shouldHighlightRight;

        return (
          <Box
            onClick={handleDateClick}
            onMouseDown={() => handleLongPressStart(dateStr)}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onContextMenu={(e) => e.preventDefault()}
            title={
              shouldShowFirstMoveDay
                ? "Нажмите для перемещения заказа в первый день"
                : shouldHighlightRight
                ? "Нажмите для выхода из режима перемещения"
                : !moveMode
                ? "Длинное нажатие для режима перемещения, обычный клик для просмотра и редактирования заказа"
                : undefined
            }
            sx={{
              border: border,
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "row",
              cursor:
                moveMode && !isActiveInMoveMode ? "not-allowed" : "pointer",
            }}
          >
            {/* Желтый overlay для первого/последнего дня перемещения */}
            {createYellowOverlay(isFirstMoveDay, isLastMoveDay)}

            <Box
              sx={{
                width: "50%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            ></Box>
            <Box
              sx={{
                width: "50%",
                height: "100%",
                borderRadius: "50% 0 0 50%",
                backgroundColor: shouldShowFirstMoveDay
                  ? "#fff3cd"
                  : shouldHighlightRight
                  ? "#1976d2"
                  : startEndInfo.confirmed
                  ? "primary.main"
                  : "primary.green",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
              }}
            ></Box>
          </Box>
        );
      }

      if (!isStartDate && isEndDate) {
        // Проверяем edge-case: если выбранный заказ начинается или заканчивается в этот день
        let shouldHighlightLeft = false;
        let shouldHighlightRight = false;

        // Проверяем, является ли это последним днем диапазона перемещения
        const isLastMoveDay =
          moveMode &&
          selectedOrderDates &&
          selectedOrderDates[selectedOrderDates.length - 1] === dateStr;
        // Для последнего дня показываем желтый полукруг только для совместимых автомобилей
        const shouldShowLastMoveDay = isLastMoveDay && isCarCompatibleForMove;

        if (selectedOrderId) {
          const selectedOrder = carOrders.find(
            (o) => o._id === selectedOrderId
          );
          if (selectedOrder) {
            const selectedOrderStart = dayjs(
              selectedOrder.rentalStartDate
            ).format("YYYY-MM-DD");
            const selectedOrderEnd = dayjs(selectedOrder.rentalEndDate).format(
              "YYYY-MM-DD"
            );

            // Ищем предыдущий заказ, который заканчивается в этот день
            const previousOrder = carOrders.find((o) => {
              const rentalEnd = dayjs(o.rentalEndDate).format("YYYY-MM-DD");
              return rentalEnd === dateStr && o._id !== selectedOrderId;
            });

            // Ищем следующий заказ, который начинается в этот день
            const nextOrder = carOrders.find((o) => {
              const rentalStart = dayjs(o.rentalStartDate).format("YYYY-MM-DD");
              return rentalStart === dateStr && o._id !== selectedOrderId;
            });

            // Если выбранный заказ начинается в этот день И есть предыдущий заказ (edge-case)
            if (selectedOrderStart === dateStr && previousOrder) {
              shouldHighlightLeft = false; // не подсвечивать левую половину (предыдущий заказ)
              shouldHighlightRight = true; // подсвечивать правую половину (выбранный заказ)
            }
            // Если выбранный заказ заканчивается в этот день И есть следующий заказ (edge-case)
            else if (selectedOrderEnd === dateStr && nextOrder) {
              shouldHighlightLeft = true; // подсвечивать левую половину (выбранный заказ)
              shouldHighlightRight = false; // не подсвечивать правую половину (следующий заказ)
            } else if (isPartOfSelectedOrder(dateStr)) {
              shouldHighlightLeft = true; // обычная подсветка
            }
          }
        } else if (isPartOfSelectedOrder(dateStr)) {
          shouldHighlightLeft = true; // обычная подсветка
        }

        const isActiveInMoveMode =
          shouldShowLastMoveDay || shouldHighlightLeft || shouldHighlightRight;

        return (
          <Box
            onClick={handleDateClick}
            onMouseDown={() => handleLongPressStart(dateStr)}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onContextMenu={(e) => e.preventDefault()}
            title={
              shouldShowLastMoveDay
                ? "Нажмите для перемещения заказа в последний день"
                : shouldHighlightLeft || shouldHighlightRight
                ? "Нажмите для выхода из режима перемещения"
                : !moveMode
                ? "Длинное нажатие для режима перемещения, обычный клик для просмотра и редактирования заказа"
                : undefined
            }
            sx={{
              border: border,
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "row",
              cursor:
                moveMode && !isActiveInMoveMode ? "not-allowed" : "pointer",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Желтый overlay для первого/последнего дня перемещения */}
            {createYellowOverlay(isFirstMoveDay, isLastMoveDay)}

            <Box
              sx={{
                width: "50%",
                height: "100%",
                borderRadius: "0 50% 50% 0",
                backgroundColor: shouldShowLastMoveDay
                  ? "#fff3cd"
                  : shouldHighlightLeft
                  ? "#1976d2"
                  : startEndInfo.confirmed
                  ? "primary.main"
                  : "primary.green",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
              }}
            ></Box>
            <Box
              sx={{
                width: "50%",
                height: "100%",
                borderRadius: shouldHighlightRight ? "50% 0 0 50%" : undefined,
                backgroundColor: shouldHighlightRight ? "#1976d2" : undefined,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: shouldHighlightRight ? "white" : undefined,
              }}
            ></Box>
          </Box>
        );
      }

      return (
        <Box
          onClick={handleDateClick}
          onMouseDown={() => handleLongPressStart(dateStr)}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
          onContextMenu={(e) => e.preventDefault()}
          title={
            isPartOfSelectedOrder(dateStr)
              ? "Нажмите для выхода из режима перемещения"
              : !moveMode
              ? "Длинное нажатие для режима перемещения, обычный клик для просмотра и редактирования заказа"
              : undefined
          }
          sx={{
            position: "relative",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: gradientBackground
              ? undefined
              : backgroundColor.startsWith("#")
              ? backgroundColor
              : backgroundColor,
            background: gradientBackground || undefined,
            borderRadius,
            color,
            cursor:
              moveMode && !isPartOfSelectedOrder(dateStr)
                ? "not-allowed"
                : "pointer",
            border: border,
            width: "100%",
          }}
        >
          {/* Желтый overlay для первого/последнего дня перемещения */}
          {createYellowOverlay(isFirstMoveDay, isLastMoveDay)}
        </Box>
      );
    },
    [
      confirmedDates,
      unavailableDates,
      overlapDates,
      startEndDates,
      startEndOverlapDates,
      carOrders,
      setOpen,
      setSelectedOrders,
      onAddOrderClick,
      onLongPress,
      car,
      pressTimer,
      isLastDateForOrder,
      hasOrder,
      selectedOrderId,
      isPartOfSelectedOrder,
      getOrderByDate,
      moveMode,
      selectedMoveOrder,
      onCarSelectForMove,
      wasLongPress,
      onExitMoveMode,
      selectedOrderDates,
      isCarCompatibleForMove,
    ]
  );

  return (
    <>
      {days.map((day) => (
        <TableCell key={day.dayjs.toString()} sx={{ padding: 0 }}>
          <Box
            sx={{
              width: "100%",
              height: "50px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {renderDateCell(day.dayjs)}
          </Box>
        </TableCell>
      ))}
    </>
  );
}
