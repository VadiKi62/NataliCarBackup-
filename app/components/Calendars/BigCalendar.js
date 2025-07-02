"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  TableContainer,
  Select,
  MenuItem,
  Modal,
  Grid,
  Typography, // ← добавьте этот импорт
  Button, // ← и этот, если Button не импортирован
} from "@mui/material";
import dayjs from "dayjs";
import { useMainContext } from "@app/Context";
import CarTableRow from "./Row";
import {
  extractArraysOfStartEndConfPending,
  returnOverlapOrdersObjects,
} from "@utils/functions";
import EditOrderModal from "@app/components/Admin/Order/EditOrderModal";
import AddOrderModal from "@app/components/Admin/Order/AddOrderModal";

export default function BigCalendar({ cars }) {
  const { ordersByCarId, fetchAndUpdateOrders, allOrders } = useMainContext();

  const [month, setMonth] = useState(dayjs().month());
  const [year, setYear] = useState(dayjs().year());
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [startEndDates, setStartEndDates] = useState([]);
  const [isConflictOrder, setIsConflictOrder] = useState(false);
  const [open, setOpen] = useState(false);
  const [headerOrdersModal, setHeaderOrdersModal] = useState({
    open: false,
    date: null,
    orders: [],
  });

  // Для AddOrderModal
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [selectedCarForAdd, setSelectedCarForAdd] = useState(null);
  const [selectedDateForAdd, setSelectedDateForAdd] = useState(null);

  const handleClose = () => setOpen(false);

  //console.log("allOrders from context:", allOrders);

  // const daysInMonth = useMemo(
  //   () => dayjs().year(year).month(month).daysInMonth(),
  //   [month, year]
  // );

  // const days = useMemo(() => {
  //   return Array.from({ length: daysInMonth }, (_, index) => {
  //     const date = dayjs()
  //       .year(year)
  //       .month(month)
  //       .date(index + 1);
  //     return {
  //       dayjs: date,
  //       date: date.date(),
  //       weekday: date.format("dd"),
  //       isSunday: date.day() === 0,
  //     };
  //   });
  // }, [month, year, daysInMonth]);
  const daysInMonth = useMemo(
    () => dayjs().year(year).month(month).daysInMonth(),
    [month, year]
  );

  const days = useMemo(() => {
    // Сколько всего дней показывать
    const totalDays = daysInMonth;
    //const totalDays = daysInMonth + 15;
    return Array.from({ length: totalDays }, (_, index) => {
      const date = dayjs().year(year).month(month).date(1).add(index, "day");
      return {
        dayjs: date,
        date: date.date(),
        weekday: date.format("dd"),
        isSunday: date.day() === 0,
      };
    });
  }, [month, year, daysInMonth]);

  // Индекс сегодняшнего дня в массиве days
  const today = dayjs();
  const todayIndex = days.findIndex((d) => d.dayjs.isSame(today, "day"));

  const handleSelectMonth = (e) => setMonth(e.target.value);
  const handleSelectYear = (e) => setYear(e.target.value);

  const ordersByCarIdWithAllorders = useCallback((carId, orders) => {
    return orders?.filter((order) => order.car === carId);
  }, []);

  useEffect(() => {
    const { startEnd } = extractArraysOfStartEndConfPending(allOrders);
    setStartEndDates(startEnd);
  }, [allOrders]);

  const handleSaveOrder = async (updatedOrder) => {
    setSelectedOrders((prevSelectedOrders) =>
      prevSelectedOrders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
    await fetchAndUpdateOrders();
  };

  const sortedCars = useMemo(() => {
    return [...cars].sort((a, b) => a.model.localeCompare(b.model));
  }, [cars]);

  // Обработчик для открытия AddOrderModal по клику по пустой ячейке
  const handleAddOrderClick = (car, dateStr) => {
    setSelectedCarForAdd(car);
    setSelectedDateForAdd(dateStr); // строка даты "YYYY-MM-DD"
    setIsAddOrderOpen(true);
  };

  const selectedDate =
    headerOrdersModal.date &&
    dayjs(headerOrdersModal.date).format("YYYY-MM-DD");

  const startedOrders = headerOrdersModal.orders.filter((order) => {
    const start = dayjs(order.rentalStartDate).format("YYYY-MM-DD");
    return start === selectedDate;
  });

  const endedOrders = headerOrdersModal.orders.filter((order) => {
    const end = dayjs(order.rentalEndDate).format("YYYY-MM-DD");
    return end === selectedDate;
  });

  const getRegNumberByCarNumber = (carNumber) => {
    const car = cars.find((c) => c.carNumber === carNumber);
    return car ? car.regNumber : carNumber; // если не найдено — покажет carNumber
  };

  return (
    <Box
      sx={{
        overflowX: "auto",
        overflowY: "hidden",
        pt: 10,
        maxWidth: "100vw",
        zIndex: 100,
        height: "calc(100vh - 10px)",
      }}
      // sx={{
      //   position: "sticky",
      //   top: 0,
      //   //backgroundColor: idx === todayIndex ? "#ffe082" : "white",
      //   zIndex: 4,
      //   fontSize: "12px", // было 16px
      //   padding: "2px", // было 6px
      //   minWidth: 32, // было 40
      //   fontWeight: "bold",
      // }}
    >
      <style>
        {`
          .today-column-bg {
            background-color: #ffe082 !important;
          }
        `}
      </style>
      <TableContainer
        sx={{
          maxHeight: "calc(100vh - 80px)",
          border: "1px solid #ddd",
          overflow: "auto",
        }}
      >
        <Table stickyHeader sx={{ width: "auto" }}>
          <TableHead>
            <TableRow>
              {/* Sticky Left Column for Car Names */}
              <TableCell
                sx={{
                  position: "sticky",
                  left: 0,
                  backgroundColor: "white",
                  zIndex: 5,
                  fontWeight: "bold",
                  minWidth: 120,
                }}
              >
                <Select
                  value={month}
                  onChange={handleSelectMonth}
                  size="small"
                  sx={{ mx: 1 }}
                >
                  {Array.from({ length: 12 }, (_, index) => (
                    <MenuItem key={index} value={index}>
                      {dayjs().month(index).format("MMMM")}
                    </MenuItem>
                  ))}
                </Select>
                <Select
                  value={year}
                  onChange={handleSelectYear}
                  size="small"
                  sx={{ mx: 1 }}
                >
                  {Array.from({ length: 5 }, (_, index) => (
                    <MenuItem key={index} value={year - 2 + index}>
                      {year - 2 + index}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
              {/* {days.map((day, idx) => (
                <TableCell
                  key={day.dayjs}
                  align="center"
                  sx={{
                    position: "sticky",
                    top: 0,
                    backgroundColor: idx === todayIndex ? "#ffe082" : "white",
                    zIndex: 4,
                    fontSize: "16px",
                    padding: "6px",
                    minWidth: 40,
                    fontWeight: "bold",
                  }}
                >
                  <div style={{ color: day.isSunday ? "red" : "inherit" }}>
                    {day.date}
                  </div>
                  <div style={{ color: day.isSunday ? "red" : "inherit" }}>
                    {day.weekday}
                  </div>
                </TableCell>
              ))} */}
              {days.map((day, idx) => (
                <TableCell
                  key={day.dayjs}
                  align="center"
                  sx={{
                    position: "sticky",
                    top: 0,
                    backgroundColor: idx === todayIndex ? "#ffe082" : "white",
                    zIndex: 4,
                    fontSize: "16px",
                    padding: "6px",
                    minWidth: 40,
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    console.log("orders in header click:", allOrders);
                    setHeaderOrdersModal({
                      open: true,
                      date: day.dayjs, // или day.dayjs.format("DD.MM.YYYY") если нужно строкой
                      orders: allOrders, // показываем все заказы
                    });
                  }}
                >
                  <div style={{ color: day.isSunday ? "red" : "inherit" }}>
                    {day.date}
                  </div>
                  <div style={{ color: day.isSunday ? "red" : "inherit" }}>
                    {day.weekday}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedCars.map((car) => (
              <TableRow key={car._id}>
                <TableCell
                  sx={{
                    position: "sticky",
                    left: 0,
                    backgroundColor: "secondary.dark",
                    color: "text.light",
                    zIndex: 3,
                    padding: 0,
                    minWidth: 120,
                  }}
                >
                  {car.model} {car.regNumber}
                </TableCell>
                {/* Рендерим строки дней с выделением сегодняшнего столбца */}
                <CarTableRow
                  key={car._id}
                  car={car}
                  //orders={ordersByCarIdWithAllorders(car._id, orders)}
                  orders={ordersByCarIdWithAllorders(car._id, allOrders)}
                  days={days}
                  ordersByCarId={ordersByCarId}
                  setSelectedOrders={setSelectedOrders}
                  setOpen={setOpen}
                  onAddOrderClick={handleAddOrderClick}
                  todayIndex={todayIndex}
                />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
                isConflictOrder={selectedOrders.length > 1 ? true : false}
                setIsConflictOrder={setIsConflictOrder}
                startEndDates={startEndDates}
                cars={cars}
              />
            </Grid>
          ))}
        </Grid>
      </Modal>

      {/* AddOrderModal для создания нового заказа */}
      {isAddOrderOpen && selectedCarForAdd && (
        <AddOrderModal
          open={isAddOrderOpen}
          onClose={() => setIsAddOrderOpen(false)}
          car={selectedCarForAdd}
          date={selectedDateForAdd}
          setUpdateStatus={() => {}}
        />
      )}
      {/* ВСТАВЬТЕ СЮДА МОДАЛЬНОЕ ОКНО ДЛЯ ЗАКАЗОВ ПО ДАТЕ В ШАПКЕ */}
      <Modal
        open={headerOrdersModal.open}
        onClose={() =>
          setHeaderOrdersModal({ ...headerOrdersModal, open: false })
        }
      >
        <Box
          id="print-orders-modal"
          sx={{
            background: "white",
            p: 3,
            borderRadius: 2,
            minWidth: 800,
            maxWidth: 1000,
            width: "fit-content",
            mx: "auto",
            my: "10vh",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <Grid container spacing={4}>
            {/* Левая часть — начинаются */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  align="center"
                  sx={{ color: "black" }} // или любой другой цвет
                >
                  Заказы, начинающиеся{" "}
                  {headerOrdersModal.date &&
                    headerOrdersModal.date.format("DD.MM.YY")}
                </Typography>
                {startedOrders.length === 0 ? (
                  <Typography align="center" sx={{ color: "black" }}>
                    Нет заказов, начинающихся в эту дату
                  </Typography>
                ) : (
                  <Table size="small" sx={{ mb: 4 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            width: 220,
                            minWidth: 220,
                            maxWidth: 220,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Машина
                        </TableCell>
                        <TableCell
                          sx={{
                            width: 120,
                            minWidth: 120,
                            maxWidth: 120,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Госномер
                        </TableCell>
                        <TableCell
                          sx={{
                            width: 160,
                            minWidth: 160,
                            maxWidth: 160,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Срок
                        </TableCell>
                        <TableCell
                          sx={{
                            width: 160,
                            minWidth: 160,
                            maxWidth: 160,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Клиент
                        </TableCell>
                        <TableCell
                          sx={{
                            width: 140,
                            minWidth: 140,
                            maxWidth: 140,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Телефон
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {startedOrders.map((order, idx) => (
                        <TableRow key={order._id || idx}>
                          <TableCell
                            sx={{
                              width: 220,
                              minWidth: 220,
                              maxWidth: 220,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {order.carModel}
                          </TableCell>
                          <TableCell
                            sx={{
                              width: 120,
                              minWidth: 120,
                              maxWidth: 120,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {getRegNumberByCarNumber(order.carNumber)}
                          </TableCell>
                          <TableCell
                            sx={{
                              width: 160,
                              minWidth: 160,
                              maxWidth: 160,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {order.rentalStartDate
                              ? `${dayjs(order.rentalStartDate).format(
                                  "DD.MM.YY"
                                )}-${dayjs(order.rentalEndDate).format(
                                  "DD.MM.YY"
                                )}`
                              : ""}
                          </TableCell>
                          <TableCell
                            sx={{
                              width: 160,
                              minWidth: 160,
                              maxWidth: 160,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {order.customerName}
                          </TableCell>
                          <TableCell
                            sx={{
                              width: 140,
                              minWidth: 140,
                              maxWidth: 140,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {order.phone}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Box>

              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  align="center"
                  sx={{ color: "black" }} // ← черный цвет
                >
                  Заказы, заканчивающиеся{" "}
                  {headerOrdersModal.date &&
                    headerOrdersModal.date.format("DD.MM.YY")}
                </Typography>
                {endedOrders.length === 0 ? (
                  <Typography align="center" sx={{ color: "black" }}>
                    Нет заказов, заканчивающихся в эту дату
                  </Typography>
                ) : (
                  <Table size="small" sx={{ mb: 4 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            width: 220,
                            minWidth: 220,
                            maxWidth: 220,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Машина
                        </TableCell>
                        <TableCell
                          sx={{
                            width: 120,
                            minWidth: 120,
                            maxWidth: 120,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Госномер
                        </TableCell>
                        <TableCell
                          sx={{
                            width: 160,
                            minWidth: 160,
                            maxWidth: 160,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Срок
                        </TableCell>
                        <TableCell
                          sx={{
                            width: 160,
                            minWidth: 160,
                            maxWidth: 160,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Клиент
                        </TableCell>
                        <TableCell
                          sx={{
                            width: 140,
                            minWidth: 140,
                            maxWidth: 140,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Телефон
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {endedOrders.map((order, idx) => (
                        <TableRow key={order._id || idx}>
                          <TableCell
                            sx={{
                              width: 220,
                              minWidth: 220,
                              maxWidth: 220,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {order.carModel}
                          </TableCell>
                          <TableCell
                            sx={{
                              width: 120,
                              minWidth: 120,
                              maxWidth: 120,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {getRegNumberByCarNumber(order.carNumber)}
                          </TableCell>
                          <TableCell
                            sx={{
                              width: 160,
                              minWidth: 160,
                              maxWidth: 160,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {order.rentalStartDate
                              ? `${dayjs(order.rentalStartDate).format(
                                  "DD.MM.YY"
                                )}-${dayjs(order.rentalEndDate).format(
                                  "DD.MM.YY"
                                )}`
                              : ""}
                          </TableCell>
                          <TableCell
                            sx={{
                              width: 160,
                              minWidth: 160,
                              maxWidth: 160,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {order.customerName}
                          </TableCell>
                          <TableCell
                            sx={{
                              width: 140,
                              minWidth: 140,
                              maxWidth: 140,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {order.phone}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Box>
            </Grid>
          </Grid>

          <Button
            className="no-print"
            onClick={() => window.print()}
            variant="outlined"
            sx={{ mt: 2, mr: 2 }}
          >
            Печать
          </Button>
          <Button
            className="no-print"
            onClick={() =>
              setHeaderOrdersModal({ ...headerOrdersModal, open: false })
            }
            variant="contained"
            sx={{ mt: 2 }}
          >
            Закрыть
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
