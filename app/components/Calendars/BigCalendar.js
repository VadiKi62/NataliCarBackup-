// "use client";
// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Box,
//   TableContainer,
//   Select,
//   MenuItem,
//   Modal,
//   Grid,
// } from "@mui/material";
// import dayjs from "dayjs";
// import { useMainContext } from "@app/Context";
// import CarTableRow from "./Row";
// import {
//   extractArraysOfStartEndConfPending,
//   returnOverlapOrdersObjects,
// } from "@utils/functions";
// import EditOrderModal from "@app/components/Admin/Order/EditOrderModal";
// import AddOrderModal from "@app/components/Admin/Order/AddOrderModal";

// export default function BigCalendar({ cars, orders }) {
//   const { ordersByCarId, fetchAndUpdateOrders, allOrders } = useMainContext();

//   const [month, setMonth] = useState(dayjs().month());
//   const [year, setYear] = useState(dayjs().year());
//   const [selectedOrders, setSelectedOrders] = useState([]);
//   const [startEndDates, setStartEndDates] = useState([]);
//   const [isConflictOrder, setIsConflictOrder] = useState(false);
//   const [open, setOpen] = useState(false);

//   // Для AddOrderModal
//   const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
//   const [selectedCarForAdd, setSelectedCarForAdd] = useState(null);
//   const [selectedDateForAdd, setSelectedDateForAdd] = useState(null);

//   const handleClose = () => setOpen(false);

//   const daysInMonth = useMemo(
//     () => dayjs().year(year).month(month).daysInMonth(),
//     [month, year]
//   );

//   const days = useMemo(() => {
//     return Array.from({ length: daysInMonth }, (_, index) => {
//       const date = dayjs()
//         .year(year)
//         .month(month)
//         .date(index + 1);
//       return {
//         dayjs: date,
//         date: date.date(),
//         weekday: date.format("dd"),
//         isSunday: date.day() === 0,
//       };
//     });
//   }, [month, year, daysInMonth]);

//   // Индекс сегодняшнего дня в массиве days
//   const today = dayjs();
//   const todayIndex = days.findIndex((d) => d.dayjs.isSame(today, "day"));

//   const handleSelectMonth = (e) => setMonth(e.target.value);
//   const handleSelectYear = (e) => setYear(e.target.value);

//   const ordersByCarIdWithAllorders = useCallback((carId, orders) => {
//     return orders?.filter((order) => order.car === carId);
//   }, []);

//   useEffect(() => {
//     const { startEnd } = extractArraysOfStartEndConfPending(allOrders);
//     setStartEndDates(startEnd);
//   }, [allOrders]);

//   const handleSaveOrder = async (updatedOrder) => {
//     setSelectedOrders((prevSelectedOrders) =>
//       prevSelectedOrders.map((order) =>
//         order._id === updatedOrder._id ? updatedOrder : order
//       )
//     );
//     await fetchAndUpdateOrders();
//   };

//   const sortedCars = useMemo(() => {
//     return [...cars].sort((a, b) => a.model.localeCompare(b.model));
//   }, [cars]);

//   // Обработчик для открытия AddOrderModal по клику по пустой ячейке
//   const handleAddOrderClick = (car, dateStr) => {
//     setSelectedCarForAdd(car);
//     setSelectedDateForAdd(dateStr); // строка даты "YYYY-MM-DD"
//     setIsAddOrderOpen(true);
//   };

//   return (
//     <Box
//       sx={{
//         overflowX: "auto",
//         overflowY: "hidden",
//         pt: 10,
//         maxWidth: "100vw",
//         zIndex: 100,
//         height: "calc(100vh - 10px)",
//       }}
//     >
//       <style>
//         {`
//           .today-column-bg {
//             background-color: #ffe082 !important;
//           }
//         `}
//       </style>
//       <TableContainer
//         sx={{
//           maxHeight: "calc(100vh - 80px)",
//           border: "1px solid #ddd",
//           overflow: "auto",
//         }}
//       >
//         <Table stickyHeader sx={{ width: "auto" }}>
//           <TableHead>
//             <TableRow>
//               {/* Sticky Left Column for Car Names */}
//               <TableCell
//                 sx={{
//                   position: "sticky",
//                   left: 0,
//                   backgroundColor: "white",
//                   zIndex: 5,
//                   fontWeight: "bold",
//                   minWidth: 120,
//                 }}
//               >
//                 <Select
//                   value={month}
//                   onChange={handleSelectMonth}
//                   size="small"
//                   sx={{ mx: 1 }}
//                 >
//                   {Array.from({ length: 12 }, (_, index) => (
//                     <MenuItem key={index} value={index}>
//                       {dayjs().month(index).format("MMMM")}
//                     </MenuItem>
//                   ))}
//                 </Select>
//                 <Select
//                   value={year}
//                   onChange={handleSelectYear}
//                   size="small"
//                   sx={{ mx: 1 }}
//                 >
//                   {Array.from({ length: 5 }, (_, index) => (
//                     <MenuItem key={index} value={year - 2 + index}>
//                       {year - 2 + index}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </TableCell>
//               {days.map((day, idx) => (
//                 <TableCell
//                   key={day.dayjs}
//                   align="center"
//                   sx={{
//                     position: "sticky",
//                     top: 0,
//                     backgroundColor: idx === todayIndex ? "#ffe082" : "white",
//                     zIndex: 4,
//                     fontSize: "16px",
//                     padding: "6px",
//                     minWidth: 40,
//                     fontWeight: "bold",
//                   }}
//                 >
//                   <div style={{ color: day.isSunday ? "red" : "inherit" }}>
//                     {day.date}
//                   </div>
//                   <div style={{ color: day.isSunday ? "red" : "inherit" }}>
//                     {day.weekday}
//                   </div>
//                 </TableCell>
//               ))}
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {sortedCars.map((car) => (
//               <TableRow key={car._id}>
//                 <TableCell
//                   sx={{
//                     position: "sticky",
//                     left: 0,
//                     backgroundColor: "secondary.dark",
//                     color: "text.light",
//                     zIndex: 3,
//                     padding: 0,
//                     minWidth: 120,
//                   }}
//                 >
//                   {car.model} {car.regNumber}
//                 </TableCell>
//                 {/* Рендерим строки дней с выделением сегодняшнего столбца */}
//                 <CarTableRow
//                   key={car._id}
//                   car={car}
//                   orders={ordersByCarIdWithAllorders(car._id, orders)}
//                   days={days}
//                   ordersByCarId={ordersByCarId}
//                   setSelectedOrders={setSelectedOrders}
//                   setOpen={setOpen}
//                   onAddOrderClick={handleAddOrderClick}
//                   todayIndex={todayIndex}
//                 />
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       <Modal
//         open={open}
//         onClose={handleClose}
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         <Grid
//           container
//           spacing={1}
//           justifyContent="center"
//           sx={{
//             maxWidth: "90vw",
//             maxHeight: "90vh",
//             overflow: "auto",
//             "&::-webkit-scrollbar": {
//               width: "4px",
//             },
//             "&::-webkit-scrollbar-thumb": {
//               backgroundColor: "primary.main",
//               borderRadius: "4px",
//             },
//             "&::-webkit-scrollbar-track": {
//               backgroundColor: "background.paper",
//             },
//           }}
//         >
//           {selectedOrders.map((order, index) => (
//             <Grid
//               item
//               key={order._id}
//               xs={12}
//               sm={selectedOrders.length === 1 ? 12 : 6}
//               md={
//                 selectedOrders.length === 1
//                   ? 12
//                   : selectedOrders.length === 2
//                   ? 6
//                   : selectedOrders.length >= 3 && selectedOrders.length <= 4
//                   ? 3
//                   : 2
//               }
//             >
//               <EditOrderModal
//                 order={order}
//                 open={open}
//                 onClose={handleClose}
//                 onSave={handleSaveOrder}
//                 isConflictOrder={selectedOrders.length > 1 ? true : false}
//                 setIsConflictOrder={setIsConflictOrder}
//                 startEndDates={startEndDates}
//                 cars={cars}
//               />
//             </Grid>
//           ))}
//         </Grid>
//       </Modal>

//       {/* AddOrderModal для создания нового заказа */}
//       {isAddOrderOpen && selectedCarForAdd && (
//         <AddOrderModal
//           open={isAddOrderOpen}
//           onClose={() => setIsAddOrderOpen(false)}
//           car={selectedCarForAdd}
//           date={selectedDateForAdd}
//           setUpdateStatus={() => {}}
//         />
//       )}
//     </Box>
//   );
// }

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

export default function BigCalendar({ cars, orders }) {
  const { ordersByCarId, fetchAndUpdateOrders, allOrders } = useMainContext();

  const [month, setMonth] = useState(dayjs().month());
  const [year, setYear] = useState(dayjs().year());
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [startEndDates, setStartEndDates] = useState([]);
  const [isConflictOrder, setIsConflictOrder] = useState(false);
  const [open, setOpen] = useState(false);

  // Для AddOrderModal
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [selectedCarForAdd, setSelectedCarForAdd] = useState(null);
  const [selectedDateForAdd, setSelectedDateForAdd] = useState(null);

  const handleClose = () => setOpen(false);

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
                  orders={ordersByCarIdWithAllorders(car._id, orders)}
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
    </Box>
  );
}
