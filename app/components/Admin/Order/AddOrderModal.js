// import React, { useState, useEffect, useCallback } from "react";
// import {
//   Modal,
//   Paper,
//   Typography,
//   Box,
//   TextField,
//   Button,
//   CircularProgress,
//   Divider,
//   FormControlLabel,
// } from "@mui/material";

// import dayjs from "dayjs";
// import utc from "dayjs/plugin/utc";
// import timezone from "dayjs/plugin/timezone";
// import { LocalizationProvider } from "@mui/x-date-pickers";
// import { TimePicker } from "@mui/x-date-pickers/TimePicker";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import MuiCalendar from "@app/components/Calendars/MuiCalendar";
// import ConflictMessage from "./conflictMessage";
// import Snackbar from "@app/components/common/Snackbar";
// import { useMainContext } from "@app/Context";
// import {
//   functionToCheckDuplicates,
//   returnHoursToParseToDayjs,
//   toParseTime,
// } from "@utils/functions";
// import CalendarPicker from "@app/components/CarComponent/CalendarPicker";
// import RenderConflictMessage from "@app/components/Admin/Order/RenderConflictInAddOrder";

// import {
//   analyzeDates,
//   functionPendingOrConfirmedDatesInRange,
// } from "@utils/analyzeDates";
// import MuiTimePicker from "@app/components/Calendars/MuiTimePicker";
// import { RenderSelectField } from "@app/components/common/Fields";

// import {
//   changeRentalDates,
//   toggleConfirmedStatus,
//   updateCustomerInfo,
//   getConfirmedOrders,
//   addOrderNew,
// } from "@utils/action";
// import { useTranslation } from "react-i18next";

// // Extend dayjs with plugins
// dayjs.extend(utc);
// dayjs.extend(timezone);

// // Set the default timezone
// // const timeZone = "Europe/Athens";
// // dayjs.tz.setDefault(timeZone);

// const AddOrder = ({ open, onClose, car, setUpdateStatus }) => {
//   const { fetchAndUpdateOrders, isLoading, ordersByCarId, company } =
//     useMainContext();

//   const locations = company.locations.map((loc) => loc.name);

//   const {
//     defaultStartHour,
//     defaultStartMinute,
//     defaultEndHour,
//     defaultEndMinute,
//   } = returnHoursToParseToDayjs(company);

//   const carOrders = ordersByCarId(car?._id);
//   const [bookDates, setBookedDates] = useState({ start: null, end: null });
//   const [pendingDatesInRange, setPendingDatesInRange] = useState([]);
//   const [confirmedDatesInRange, setConfirmedDatesInRange] = useState([]);
//   const [startTime, setStartTime] = useState(
//     dayjs().hour(defaultStartHour).minute(defaultStartMinute)
//   );
//   const [endTime, setEndTime] = useState(
//     dayjs().hour(defaultEndHour).minute(defaultEndMinute)
//   );

//   const [loadingState, setLoadingState] = useState(false);
//   const [statusMessage, setStatusMessage] = useState({
//     type: null,
//     message: "",
//   });

//   const { confirmed, pending } = analyzeDates(carOrders);

//   const [orderDetails, setOrderDetails] = useState({
//     placeIn: "",
//     placeOut: "",
//     customerName: "",
//     phone: "",
//     email: "",
//     totalPrice: 0,
//     numberOfDays: 0,
//     confirmed: false,
//   });

//   // Оптимизированный обработчик изменения полей
//   const handleFieldChange = useCallback((field, value) => {
//     setOrderDetails((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   }, []);

//   const toggleConfirmedStatus = useCallback(() => {
//     setOrderDetails((prev) => ({
//       ...prev,
//       confirmed: !prev.confirmed,
//     }));
//   }, []);

//   // Мемоизированные функции проверки конфликтов
//   const checkConflictsPending = useCallback(
//     (startDate, endDate) => {
//       if (!startDate || !endDate || !pending) return [];

//       return functionPendingOrConfirmedDatesInRange(
//         pending,
//         startDate,
//         endDate
//       );
//     },
//     [pending]
//   );

//   const checkConflictsConfirmed = useCallback(
//     (startDate, endDate) => {
//       if (!startDate || !endDate || !confirmed) return [];

//       return functionPendingOrConfirmedDatesInRange(
//         confirmed,
//         startDate,
//         endDate
//       );
//     },
//     [confirmed]
//   );

//   const handleSetBookedDates = useCallback(
//     (dates) => {
//       if (!dates.start || !dates.end) {
//         setBookedDates({ start: null, end: null });
//         setPendingDatesInRange([]);
//         return;
//       }

//       const startDate = dayjs(dates.start).utc().format("YYYY-MM-DD");
//       const endDate = dayjs(dates.end).utc().format("YYYY-MM-DD");

//       const conflicts = checkConflictsPending(dates.start, dates.end);
//       const conflictsConfirmed = checkConflictsConfirmed(
//         dates.start,
//         dates.end
//       );

//       setBookedDates({
//         start: startDate,
//         end: endDate,
//       });
//       setPendingDatesInRange(conflicts);
//       setConfirmedDatesInRange(conflictsConfirmed);

//       // Улучшенное логирование конфликтов
//       if (conflicts?.length > 0) {
//         setStatusMessage({
//           type: "warning",
//           message: `Внимание: В выбранном диапазоне есть ${conflicts.length} ожидающих подтверждения бронирований`,
//         });
//       }
//       if (conflictsConfirmed?.length > 0) {
//         setStatusMessage({
//           type: "error",
//           message: `Ошибка: В выбранном диапазоне есть ${conflictsConfirmed.length} уже подтвержденных бронирований`,
//         });
//       }
//     },
//     [checkConflictsPending, checkConflictsConfirmed]
//   );

//   const handleBookingComplete = async () => {
//     setLoadingState(true);
//     setStatusMessage({ type: null, message: "" });

//     const data = {
//       carNumber: car?.carNumber,
//       customerName: orderDetails.customerName,
//       phone: orderDetails.phone,
//       email: orderDetails.email,
//       rentalStartDate: dayjs(bookDates.start)
//         .utc()
//         .hour(startTime.hour())
//         .minute(startTime.minute()),
//       rentalEndDate: dayjs(bookDates.end)
//         .utc()
//         .hour(endTime.hour())
//         .minute(endTime.minute()),
//       timeIn: dayjs(bookDates.start)
//         .utc()
//         .hour(startTime.hour())
//         .minute(startTime.minute()),
//       timeOut: dayjs(bookDates.end)
//         .utc()
//         .hour(endTime.hour())
//         .minute(endTime.minute()),
//       placeIn: orderDetails.placeIn,
//       placeOut: orderDetails.placeOut,
//       confirmed: orderDetails.confirmed,
//     };

//     try {
//       const response = await addOrderNew(data);

//       // await fetchAndUpdateOrders();

//       setStatusMessage({
//         type: "success",
//         message: response.data.message || "Заказ успешно добавлен",
//       });

//       setUpdateStatus({
//         type: 200,
//         message: response.data.message || "Заказ добавлен",
//       });

//       // Закрываем модальное окно с небольшой задержкой для отображения сообщения
//       setTimeout(() => {
//         setStatusMessage({ type: null, message: "" });
//         onClose();
//       }, 5000);
//     } catch (error) {
//       console.error("Ошибка при отправке данных:", error);

//       setStatusMessage({
//         type: "error",
//         message:
//           error.message ||
//           "Не удалось добавить заказ. Пожалуйста, проверьте данные.",
//       });

//       setUpdateStatus({
//         type: 400,
//         message: error?.message || "Ошибка сервера",
//       });
//     } finally {
//       setLoadingState(false);
//     }
//   };

//   // Отрисовка статусного сообщения
//   const renderStatusMessage = () => {
//     if (!statusMessage.message) return null;

//     const colorMap = {
//       success: "green",
//       error: "red",
//       warning: "orange",
//     };

//     return (
//       <Typography
//         variant="body2"
//         sx={{
//           color: colorMap[statusMessage.type] || "inherit",
//           textAlign: "center",
//           mt: 2,
//         }}
//       >
//         {statusMessage.message}
//       </Typography>
//     );
//   };

//   const renderDateTimeSection = () => (
//     <Box sx={{ mb: 3 }}>
//       <LocalizationProvider dateAdapter={AdapterDayjs}>
//         <MuiCalendar
//           carId={car?._id}
//           orders={carOrders}
//           isLoading={isLoading}
//           setBookedDates={handleSetBookedDates}
//         />
//         {bookDates.start && bookDates.end && pendingDatesInRange.length > 0 && (
//           <RenderConflictMessage
//             pendingDatesInRange={pendingDatesInRange}
//             startDate={bookDates.start}
//             endDate={bookDates.end}
//           />
//         )}
//         {bookDates.start &&
//           bookDates.end &&
//           confirmedDatesInRange.length > 0 && (
//             <RenderConflictMessage
//               pendingDatesInRange={confirmedDatesInRange}
//               startDate={bookDates.start}
//               endDate={bookDates.end}
//               confirmed={true}
//             />
//           )}
//         <MuiTimePicker
//           startTime={startTime}
//           endTime={endTime}
//           setStartTime={setStartTime}
//           setEndTime={setEndTime}
//         />
//       </LocalizationProvider>

//       <RenderSelectField
//         mt={2}
//         name="placeIn"
//         label={t("order.pickupLocation")}
//         options={locations}
//         updatedCar={orderDetails}
//         handleChange={(e) => handleFieldChange("placeIn", e.target.value)}
//         required
//       />
//       <RenderSelectField
//         name="placeOut"
//         label={t("order.returnLocation")}
//         updatedCar={orderDetails}
//         options={locations}
//         handleChange={(e) => handleFieldChange("placeOut", e.target.value)}
//         required
//       />

//       {/* <Box sx={{ mt: 2 }}>
//         <Typography>Всего цена: {orderDetails.totalPrice}</Typography>
//         <Typography>Кол-во дней: {orderDetails.numberOfDays}</Typography>
//       </Box> */}
//     </Box>
//   );

//   const renderCustomerSection = () => (
//     <Box sx={{ mb: 3 }}>
//       {/* <Typography variant="h6" sx={{ mb: 2 }}>
//         Информация о клиенте
//       </Typography> */}
//       <TextField
//         fullWidth
//         margin="normal"
//         label={t("order.clientName")}
//         value={orderDetails.customerName}
//         onChange={(e) => handleFieldChange("customerName", e.target.value)}
//       />
//       <TextField
//         fullWidth
//         margin="normal"
//         label={t("order.phone")}
//         value={orderDetails.phone}
//         onChange={(e) => handleFieldChange("phone", e.target.value)}
//       />
//       <TextField
//         fullWidth
//         margin="normal"
//         label={t("order.email")}
//         value={orderDetails.email}
//         onChange={(e) => handleFieldChange("email", e.target.value)}
//       />
//     </Box>
//   );

//   const { t } = useTranslation();

//   const renderConfirmationButton = () => (
//     <Button
//       variant="contained"
//       color={orderDetails.confirmed ? "success" : "error"}
//       onClick={toggleConfirmedStatus}
//       sx={{ width: "100%", mb: 2 }}
//     >
//       {orderDetails.confirmed
//         ? t("order.bookingConfirmed")
//         : t("order.confirmBooking")}
//     </Button>
//   );

//   return (
//     <Modal
//       open={open}
//       onClose={onClose}
//       sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
//     >
//       <Box
//         sx={{
//           padding: 2,
//           margin: "auto",
//           bgcolor: "background.paper",
//           maxWidth: 600,
//           maxHeight: "90vh",
//           overflow: "auto",
//         }}
//       >
//         {loadingState && (
//           <Box
//             sx={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               width: "100%",
//               height: "100%",
//               bgcolor: "rgba(0, 0, 0, 0.5)",
//               zIndex: 2,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <Box
//               sx={{
//                 textAlign: "center",
//                 color: "white",
//               }}
//             >
//               <CircularProgress color="inherit" />
//               <Typography variant="h6" sx={{ mt: 2 }}>
//                 Отправка заказа...
//               </Typography>
//             </Box>
//           </Box>
//         )}
//         <Typography variant="h6" color="primary.main">
//           {t("order.addOrder")} {car?.model}
//         </Typography>
//         <Typography variant="body2" color="primary.main">
//           {t("car.reg-numb")}: {car?.regNumber}
//         </Typography>

//         {renderConfirmationButton()}
//         {renderDateTimeSection()}
//         {renderCustomerSection()}

//         {renderStatusMessage()}

//         <Box sx={{ mt: 3 }}>
//           <Button
//             variant="contained"
//             onClick={handleBookingComplete}
//             disabled={
//               !bookDates.start ||
//               !bookDates.end ||
//               !startTime.utc() ||
//               !endTime ||
//               !orderDetails.customerName ||
//               !orderDetails.phone ||
//               loadingState
//             }
//             sx={{ width: "100%" }}
//           >
//             {t("order.CompleteBook")}
//           </Button>
//         </Box>
//       </Box>
//     </Modal>
//   );
// };

// export default AddOrder;

// import React, { useState, useEffect, useCallback } from "react";
// import {
//   Modal,
//   Paper,
//   Typography,
//   Box,
//   TextField,
//   Button,
//   CircularProgress,
//   Divider,
//   FormControlLabel,
// } from "@mui/material";

// import dayjs from "dayjs";
// import utc from "dayjs/plugin/utc";
// import timezone from "dayjs/plugin/timezone";
// import { LocalizationProvider } from "@mui/x-date-pickers";
// import { TimePicker } from "@mui/x-date-pickers/TimePicker";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import MuiCalendar from "@app/components/Calendars/MuiCalendar";
// import ConflictMessage from "./conflictMessage";
// import Snackbar from "@app/components/common/Snackbar";
// import { useMainContext } from "@app/Context";
// import {
//   functionToCheckDuplicates,
//   returnHoursToParseToDayjs,
//   toParseTime,
// } from "@utils/functions";
// import CalendarPicker from "@app/components/CarComponent/CalendarPicker";
// import RenderConflictMessage from "@app/components/Admin/Order/RenderConflictInAddOrder";

// import {
//   analyzeDates,
//   functionPendingOrConfirmedDatesInRange,
// } from "@utils/analyzeDates";
// import MuiTimePicker from "@app/components/Calendars/MuiTimePicker";
// import { RenderSelectField } from "@app/components/common/Fields";

// import {
//   changeRentalDates,
//   toggleConfirmedStatus,
//   updateCustomerInfo,
//   getConfirmedOrders,
//   addOrderNew,
// } from "@utils/action";
// import { useTranslation } from "react-i18next";

// // Extend dayjs with plugins
// dayjs.extend(utc);
// dayjs.extend(timezone);

// // Set the default timezone
// // const timeZone = "Europe/Athens";
// // dayjs.tz.setDefault(timeZone);

// const AddOrder = ({ open, onClose, car, date, setUpdateStatus }) => {
//   const { fetchAndUpdateOrders, isLoading, ordersByCarId, company } =
//     useMainContext();

//   const locations = company.locations.map((loc) => loc.name);

//   const {
//     defaultStartHour,
//     defaultStartMinute,
//     defaultEndHour,
//     defaultEndMinute,
//   } = returnHoursToParseToDayjs(company);

//   const carOrders = ordersByCarId(car?._id);
//   const [bookDates, setBookedDates] = useState({ start: null, end: null });
//   const [pendingDatesInRange, setPendingDatesInRange] = useState([]);
//   const [confirmedDatesInRange, setConfirmedDatesInRange] = useState([]);
//   const [startTime, setStartTime] = useState(
//     dayjs().hour(defaultStartHour).minute(defaultStartMinute)
//   );
//   const [endTime, setEndTime] = useState(
//     dayjs().hour(defaultEndHour).minute(defaultEndMinute)
//   );

//   const [loadingState, setLoadingState] = useState(false);
//   const [statusMessage, setStatusMessage] = useState({
//     type: null,
//     message: "",
//   });

//   const { confirmed, pending } = analyzeDates(carOrders);

//   const [orderDetails, setOrderDetails] = useState({
//     placeIn: "",
//     placeOut: "",
//     customerName: "",
//     phone: "",
//     email: "",
//     totalPrice: 0,
//     numberOfDays: 0,
//     confirmed: false,
//   });

//   // --- ВАЖНО: автоматическое заполнение даты при открытии модального окна ---
//   useEffect(() => {
//     if (date && open) {
//       setBookedDates((prev) => ({
//         ...prev,
//         start: date,
//         end: date, // если хотите, чтобы дата окончания тоже ставилась по умолчанию
//       }));
//     }
//   }, [date, open]);

//   // useEffect(() => {
//   //   if (date && open) {
//   //     const start = date;
//   //     const end = dayjs(date).add(1, "day").format("YYYY-MM-DD");
//   //     setBookedDates((prev) => ({
//   //       ...prev,
//   //       start,
//   //       end,
//   //     }));
//   //   }
//   // }, [date, open]);

//   // useEffect(() => {
//   //   if (date && open) {
//   //     const start = dayjs(date).format("DD/MM/YYYY");
//   //     const end = dayjs(date).add(1, "day").format("DD/MM/YYYY");
//   //     setBookedDates((prev) => ({
//   //       ...prev,
//   //       start,
//   //       end,
//   //     }));
//   //   }
//   // }, [date, open]);

//   // useEffect(() => {
//   //   if (date && open) {
//   //     const start = dayjs(date).format("YYYY-MM-DD");
//   //     const end = dayjs(date).add(1, "day").format("YYYY-MM-DD");
//   //     setBookedDates((prev) => ({
//   //       ...prev,
//   //       start,
//   //       end,
//   //     }));
//   //   }
//   // }, [date, open]);
//   // --------------------------------------------------------------------------

//   // Оптимизированный обработчик изменения полей
//   const handleFieldChange = useCallback((field, value) => {
//     setOrderDetails((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   }, []);

//   const toggleConfirmedStatus = useCallback(() => {
//     setOrderDetails((prev) => ({
//       ...prev,
//       confirmed: !prev.confirmed,
//     }));
//   }, []);

//   // Мемоизированные функции проверки конфликтов
//   const checkConflictsPending = useCallback(
//     (startDate, endDate) => {
//       if (!startDate || !endDate || !pending) return [];

//       return functionPendingOrConfirmedDatesInRange(
//         pending,
//         startDate,
//         endDate
//       );
//     },
//     [pending]
//   );

//   const checkConflictsConfirmed = useCallback(
//     (startDate, endDate) => {
//       if (!startDate || !endDate || !confirmed) return [];

//       return functionPendingOrConfirmedDatesInRange(
//         confirmed,
//         startDate,
//         endDate
//       );
//     },
//     [confirmed]
//   );

//   const handleSetBookedDates = useCallback(
//     (dates) => {
//       if (!dates.start || !dates.end) {
//         setBookedDates({ start: null, end: null });
//         setPendingDatesInRange([]);
//         setConfirmedDatesInRange([]);
//         return;
//       }

//       const startDate = dayjs(dates.start).format("YYYY-MM-DD");
//       const endDate = dayjs(dates.end).format("YYYY-MM-DD"); // Используем выбранную дату окончания

//       const conflicts = checkConflictsPending(dates.start, dates.end);
//       const conflictsConfirmed = checkConflictsConfirmed(
//         dates.start,
//         dates.end
//       );

//       setBookedDates({
//         start: startDate,
//         end: endDate,
//       });
//       setPendingDatesInRange(conflicts);
//       setConfirmedDatesInRange(conflictsConfirmed);

//       // Улучшенное логирование конфликтов
//       if (conflicts?.length > 0) {
//         setStatusMessage({
//           type: "warning",
//           message: `Внимание: В выбранном диапазоне есть ${conflicts.length} ожидающих подтверждения бронирований`,
//         });
//       } else if (conflictsConfirmed?.length > 0) {
//         setStatusMessage({
//           type: "error",
//           message: `Ошибка: В выбранном диапазоне есть ${conflictsConfirmed.length} уже подтвержденных бронирований`,
//         });
//       } else {
//         setStatusMessage({ type: null, message: "" });
//       }
//     },
//     [checkConflictsPending, checkConflictsConfirmed]
//   );

//   const handleBookingComplete = async () => {
//     setLoadingState(true);
//     setStatusMessage({ type: null, message: "" });

//     const data = {
//       carNumber: car?.carNumber,
//       customerName: orderDetails.customerName,
//       phone: orderDetails.phone,
//       email: orderDetails.email,
//       rentalStartDate: dayjs(bookDates.start)
//         //  .utc()
//         .hour(startTime.hour())
//         .minute(startTime.minute()),
//       rentalEndDate: dayjs(bookDates.end)
//         //  .utc()
//         .hour(endTime.hour())
//         .minute(endTime.minute()),
//       timeIn: dayjs(bookDates.start)
//         //  .utc()
//         .hour(startTime.hour())
//         .minute(startTime.minute()),
//       timeOut: dayjs(bookDates.end)
//         //  .utc()
//         .hour(endTime.hour())
//         .minute(endTime.minute()),
//       placeIn: orderDetails.placeIn,
//       placeOut: orderDetails.placeOut,
//       confirmed: orderDetails.confirmed,
//     };

//     try {
//       const response = await addOrderNew(data);

//       setStatusMessage({
//         type: "success",
//         message: response.data.message || "Заказ успешно добавлен",
//       });

//       setUpdateStatus({
//         type: 200,
//         message: response.data.message || "Заказ добавлен",
//       });

//       // Закрываем модальное окно с небольшой задержкой для отображения сообщения
//       setTimeout(() => {
//         setStatusMessage({ type: null, message: "" });
//         onClose();
//       }, 5000);
//     } catch (error) {
//       console.error("Ошибка при отправке данных:", error);

//       setStatusMessage({
//         type: "error",
//         message:
//           error?.message ||
//           "Не удалось добавить заказ. Пожалуйста, проверьте данные.",
//       });

//       setUpdateStatus({
//         type: 400,
//         message: error?.message || "Ошибка сервера",
//       });
//     } finally {
//       setLoadingState(false);
//     }
//   };

//   // Отрисовка статусного сообщения
//   const renderStatusMessage = () => {
//     if (!statusMessage.message) return null;

//     const colorMap = {
//       success: "green",
//       error: "red",
//       warning: "orange",
//     };

//     return (
//       <Typography
//         variant="body2"
//         sx={{
//           color: colorMap[statusMessage.type] || "inherit",
//           textAlign: "center",
//           mt: 2,
//         }}
//       >
//         {statusMessage.message}
//       </Typography>
//     );
//   };

//   const renderDateTimeSection = () => (
//     <Box sx={{ mb: 3 }}>
//       <Box sx={{ display: "flex", gap: 2 }}>
//         <TextField
//           label={t("order.pickupDate")}
//           type="date"
//           value={bookDates.start || ""}
//           onChange={(e) =>
//             setBookedDates((dates) => ({ ...dates, start: e.target.value }))
//           }
//           fullWidth
//           margin="normal"
//         />
//         <TextField
//           label={t("order.returnDate")}
//           type="date"
//           value={bookDates.end || ""}
//           onChange={(e) =>
//             setBookedDates((dates) => ({ ...dates, end: e.target.value }))
//           }
//           fullWidth
//           margin="normal"
//         />
//       </Box>
//       <Box sx={{ display: "flex", gap: 2 }}>
//         <TextField
//           label={t("order.pickupTime")}
//           type="time"
//           value={startTime.format("HH:mm")}
//           onChange={(e) => setStartTime(dayjs(e.target.value, "HH:mm"))}
//           margin="normal"
//           sx={{ flex: 1 }}
//         />
//         <TextField
//           label={t("order.returnTime")}
//           type="time"
//           value={endTime.format("HH:mm")}
//           onChange={(e) => setEndTime(dayjs(e.target.value, "HH:mm"))}
//           margin="normal"
//           sx={{ flex: 1 }}
//         />
//       </Box>
//       {/* Остальные поля */}
//       <RenderSelectField
//         mt={2}
//         name="placeIn"
//         label={t("order.pickupLocation")}
//         options={locations}
//         updatedCar={orderDetails}
//         handleChange={(e) => handleFieldChange("placeIn", e.target.value)}
//         required
//       />
//       <RenderSelectField
//         name="placeOut"
//         label={t("order.returnLocation")}
//         updatedCar={orderDetails}
//         options={locations}
//         handleChange={(e) => handleFieldChange("placeOut", e.target.value)}
//         required
//       />
//     </Box>
//   );

//   const renderCustomerSection = () => (
//     <Box sx={{ mb: 3 }}>
//       <TextField
//         fullWidth
//         margin="normal"
//         label={t("order.clientName")}
//         value={orderDetails.customerName}
//         onChange={(e) => handleFieldChange("customerName", e.target.value)}
//       />
//       <TextField
//         fullWidth
//         margin="normal"
//         label={t("order.phone")}
//         value={orderDetails.phone}
//         onChange={(e) => handleFieldChange("phone", e.target.value)}
//       />
//       <TextField
//         fullWidth
//         margin="normal"
//         label={t("order.email")}
//         value={orderDetails.email}
//         onChange={(e) => handleFieldChange("email", e.target.value)}
//       />
//     </Box>
//   );

//   const { t } = useTranslation();

//   const renderConfirmationButton = () => (
//     <Button
//       variant="contained"
//       color={orderDetails.confirmed ? "success" : "error"}
//       onClick={toggleConfirmedStatus}
//       sx={{ width: "100%", mb: 2 }}
//     >
//       {orderDetails.confirmed
//         ? t("order.bookingConfirmed")
//         : t("order.confirmBooking")}
//     </Button>
//   );

//   return (
//     <Modal
//       open={open}
//       onClose={onClose}
//       sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
//     >
//       <Box
//         sx={{
//           padding: 2,
//           margin: "auto",
//           bgcolor: "background.paper",
//           maxWidth: 600,
//           maxHeight: "90vh",
//           overflow: "auto",
//         }}
//       >
//         {loadingState && (
//           <Box
//             sx={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               width: "100%",
//               height: "100%",
//               bgcolor: "rgba(0, 0, 0, 0.5)",
//               zIndex: 2,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <Box
//               sx={{
//                 textAlign: "center",
//                 color: "white",
//               }}
//             >
//               <CircularProgress color="inherit" />
//               <Typography variant="h6" sx={{ mt: 2 }}>
//                 Отправка заказа...
//               </Typography>
//             </Box>
//           </Box>
//         )}
//         <Typography variant="h6" color="primary.main">
//           {t("order.addOrder")} {car?.model}
//         </Typography>
//         <Typography variant="body2" color="primary.main">
//           {t("car.reg-numb")}: {car?.regNumber}
//         </Typography>

//         {renderConfirmationButton()}
//         {renderDateTimeSection()}
//         {renderCustomerSection()}

//         {renderStatusMessage()}

//         <Box sx={{ mt: 3 }}>
//           <Button
//             variant="contained"
//             onClick={handleBookingComplete}
//             disabled={
//               !bookDates.start ||
//               !bookDates.end ||
//               !startTime.utc() ||
//               !endTime ||
//               !orderDetails.customerName ||
//               !orderDetails.phone ||
//               loadingState
//             }
//             sx={{ width: "100%" }}
//           >
//             {t("order.CompleteBook")}
//           </Button>
//         </Box>
//       </Box>
//     </Modal>
//   );
// };

// export default AddOrder;

import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Divider,
  FormControlLabel,
} from "@mui/material";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import MuiCalendar from "@app/components/Calendars/MuiCalendar";
import ConflictMessage from "./conflictMessage";
import Snackbar from "@app/components/common/Snackbar";
import { useMainContext } from "@app/Context";
import {
  functionToCheckDuplicates,
  returnHoursToParseToDayjs,
  toParseTime,
} from "@utils/functions";
import CalendarPicker from "@app/components/CarComponent/CalendarPicker";
import RenderConflictMessage from "@app/components/Admin/Order/RenderConflictInAddOrder";

import {
  analyzeDates,
  functionPendingOrConfirmedDatesInRange,
} from "@utils/analyzeDates";
import MuiTimePicker from "@app/components/Calendars/MuiTimePicker";
import { RenderSelectField } from "@app/components/common/Fields";

import {
  changeRentalDates,
  toggleConfirmedStatus,
  updateCustomerInfo,
  getConfirmedOrders,
  addOrderNew,
} from "@utils/action";
import { useTranslation } from "react-i18next";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const AddOrder = ({ open, onClose, car, date, setUpdateStatus }) => {
  const { fetchAndUpdateOrders, isLoading, ordersByCarId, company } =
    useMainContext();

  const locations = company.locations.map((loc) => loc.name);

  const {
    defaultStartHour,
    defaultStartMinute,
    defaultEndHour,
    defaultEndMinute,
  } = returnHoursToParseToDayjs(company);

  const carOrders = ordersByCarId(car?._id);
  const [bookDates, setBookedDates] = useState({ start: null, end: null });
  const [pendingDatesInRange, setPendingDatesInRange] = useState([]);
  const [confirmedDatesInRange, setConfirmedDatesInRange] = useState([]);
  const [startTime, setStartTime] = useState(
    dayjs().hour(defaultStartHour).minute(defaultStartMinute)
  );
  const [endTime, setEndTime] = useState(
    dayjs().hour(defaultEndHour).minute(defaultEndMinute)
  );

  const [loadingState, setLoadingState] = useState(false);
  const [statusMessage, setStatusMessage] = useState({
    type: null,
    message: "",
  });

  const { confirmed, pending } = analyzeDates(carOrders);

  const [orderDetails, setOrderDetails] = useState({
    placeIn: "",
    placeOut: "",
    customerName: "",
    phone: "",
    email: "",
    totalPrice: 0,
    numberOfDays: 0,
    confirmed: false,
  });

  // --- ВАЖНО: автоматическое заполнение даты при открытии модального окна ---
  useEffect(() => {
    if (date && open) {
      const startDate = dayjs(date).format("YYYY-MM-DD");
      const endDate = dayjs(date).add(1, "day").format("YYYY-MM-DD"); // Добавляем 1 день к дате начала

      setBookedDates({
        start: startDate,
        end: endDate,
      });
    }
  }, [date, open]);

  // Оптимизированный обработчик изменения полей
  const handleFieldChange = useCallback((field, value) => {
    setOrderDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const toggleConfirmedStatus = useCallback(() => {
    setOrderDetails((prev) => ({
      ...prev,
      confirmed: !prev.confirmed,
    }));
  }, []);

  // Мемоизированные функции проверки конфликтов
  const checkConflictsPending = useCallback(
    (startDate, endDate) => {
      if (!startDate || !endDate || !pending) return [];

      return functionPendingOrConfirmedDatesInRange(
        pending,
        startDate,
        endDate
      );
    },
    [pending]
  );

  const checkConflictsConfirmed = useCallback(
    (startDate, endDate) => {
      if (!startDate || !endDate || !confirmed) return [];

      return functionPendingOrConfirmedDatesInRange(
        confirmed,
        startDate,
        endDate
      );
    },
    [confirmed]
  );

  const handleSetBookedDates = useCallback(
    (dates) => {
      if (!dates.start || !dates.end) {
        setBookedDates({ start: null, end: null });
        setPendingDatesInRange([]);
        setConfirmedDatesInRange([]);
        return;
      }

      const startDate = dayjs(dates.start).format("YYYY-MM-DD");
      const endDate = dayjs(dates.end).format("YYYY-MM-DD"); // Используем выбранную дату окончания

      const conflicts = checkConflictsPending(dates.start, dates.end);
      const conflictsConfirmed = checkConflictsConfirmed(
        dates.start,
        dates.end
      );

      setBookedDates({
        start: startDate,
        end: endDate,
      });
      setPendingDatesInRange(conflicts);
      setConfirmedDatesInRange(conflictsConfirmed);

      // Улучшенное логирование конфликтов
      if (conflicts?.length > 0) {
        setStatusMessage({
          type: "warning",
          message: `Внимание: В выбранном диапазоне есть ${conflicts.length} ожидающих подтверждения бронирований`,
        });
      } else if (conflictsConfirmed?.length > 0) {
        setStatusMessage({
          type: "error",
          message: `Ошибка: В выбранном диапазоне есть ${conflictsConfirmed.length} уже подтвержденных бронирований`,
        });
      } else {
        setStatusMessage({ type: null, message: "" });
      }
    },
    [checkConflictsPending, checkConflictsConfirmed]
  );

  const handleBookingComplete = async () => {
    setLoadingState(true);
    setStatusMessage({ type: null, message: "" });

    const data = {
      carNumber: car?.carNumber,
      customerName: orderDetails.customerName,
      phone: orderDetails.phone,
      email: orderDetails.email,
      rentalStartDate: dayjs(bookDates.start)
        //  .utc()
        .hour(startTime.hour())
        .minute(startTime.minute()),
      rentalEndDate: dayjs(bookDates.end)
        //  .utc()
        .hour(endTime.hour())
        .minute(endTime.minute()),
      timeIn: dayjs(bookDates.start)
        //  .utc()
        .hour(startTime.hour())
        .minute(startTime.minute()),
      timeOut: dayjs(bookDates.end)
        //  .utc()
        .hour(endTime.hour())
        .minute(endTime.minute()),
      placeIn: orderDetails.placeIn,
      placeOut: orderDetails.placeOut,
      confirmed: orderDetails.confirmed,
    };

    try {
      const response = await addOrderNew(data);

      setStatusMessage({
        type: "success",
        message: response.data.message || "Заказ успешно добавлен",
      });

      setUpdateStatus({
        type: 200,
        message: response.data.message || "Заказ добавлен",
      });

      // Закрываем модальное окно с небольшой задержкой для отображения сообщения
      setTimeout(() => {
        setStatusMessage({ type: null, message: "" });
        onClose();
      }, 5000);
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);

      setStatusMessage({
        type: "error",
        message:
          error?.message ||
          "Не удалось добавить заказ. Пожалуйста, проверьте данные.",
      });

      setUpdateStatus({
        type: 400,
        message: error?.message || "Ошибка сервера",
      });
    } finally {
      setLoadingState(false);
    }
  };

  // Отрисовка статусного сообщения
  const renderStatusMessage = () => {
    if (!statusMessage.message) return null;

    const colorMap = {
      success: "green",
      error: "red",
      warning: "orange",
    };

    return (
      <Typography
        variant="body2"
        sx={{
          color: colorMap[statusMessage.type] || "inherit",
          textAlign: "center",
          mt: 2,
        }}
      >
        {statusMessage.message}
      </Typography>
    );
  };

  const renderDateTimeSection = () => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          label={t("order.pickupDate")}
          type="date"
          value={bookDates.start || ""}
          onChange={(e) =>
            setBookedDates((dates) => ({ ...dates, start: e.target.value }))
          }
          fullWidth
          margin="dense"
        />
        <TextField
          label={t("order.returnDate")}
          type="date"
          value={bookDates.end || ""}
          onChange={(e) =>
            setBookedDates((dates) => ({ ...dates, end: e.target.value }))
          }
          fullWidth
          margin="dense"
        />
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          label={t("order.pickupTime")}
          type="time"
          value={startTime.format("HH:mm")}
          onChange={(e) => setStartTime(dayjs(e.target.value, "HH:mm"))}
          margin="dense"
          sx={{ flex: 1 }}
        />
        <TextField
          label={t("order.returnTime")}
          type="time"
          value={endTime.format("HH:mm")}
          onChange={(e) => setEndTime(dayjs(e.target.value, "HH:mm"))}
          margin="dense"
          sx={{ flex: 1 }}
        />
      </Box>
      {/* Места получения и возврата в одну строку */}
      <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
        <RenderSelectField
          name="placeIn"
          label={t("order.pickupLocation")}
          options={locations}
          updatedCar={orderDetails}
          handleChange={(e) => handleFieldChange("placeIn", e.target.value)}
          required
          sx={{ flex: 1 }}
        />
        <RenderSelectField
          name="placeOut"
          label={t("order.returnLocation")}
          updatedCar={orderDetails}
          options={locations}
          handleChange={(e) => handleFieldChange("placeOut", e.target.value)}
          required
          sx={{ flex: 1 }}
        />
      </Box>
    </Box>
  );

  const renderCustomerSection = () => (
    <Box sx={{ mb: 2, mt: -1 }}>
      <TextField
        fullWidth
        margin="dense"
        label={t("order.clientName")}
        value={orderDetails.customerName}
        onChange={(e) => handleFieldChange("customerName", e.target.value)}
      />
      <TextField
        fullWidth
        margin="dense"
        label={t("order.phone")}
        value={orderDetails.phone}
        onChange={(e) => handleFieldChange("phone", e.target.value)}
      />
      <TextField
        fullWidth
        margin="dense"
        label={t("order.email")}
        value={orderDetails.email}
        onChange={(e) => handleFieldChange("email", e.target.value)}
      />
    </Box>
  );

  const { t } = useTranslation();

  const renderConfirmationButton = () => (
    <Button
      variant="contained"
      color={orderDetails.confirmed ? "success" : "error"}
      onClick={toggleConfirmedStatus}
      sx={{ width: "100%", mb: 2 }}
    >
      {orderDetails.confirmed
        ? t("order.bookingConfirmed")
        : t("order.confirmBooking")}
    </Button>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          padding: 2,
          margin: "auto",
          bgcolor: "background.paper",
          maxWidth: 600,
          maxHeight: "75vh",
          overflow: "auto",
          borderRadius: 2,
        }}
      >
        {loadingState && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              bgcolor: "rgba(0, 0, 0, 0.5)",
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                textAlign: "center",
                color: "white",
              }}
            >
              <CircularProgress color="inherit" />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Отправка заказа...
              </Typography>
            </Box>
          </Box>
        )}
        <Typography variant="h6" color="primary.main">
          {t("order.addOrder")} {car?.model}
        </Typography>
        <Typography variant="body2" color="primary.main">
          {t("car.reg-numb")}: {car?.regNumber}
        </Typography>

        {renderDateTimeSection()}
        {renderCustomerSection()}

        {renderStatusMessage()}

        <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loadingState}
            sx={{ minWidth: "120px" }}
          >
            {t("basic.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleBookingComplete}
            disabled={
              !bookDates.start ||
              !bookDates.end ||
              !startTime ||
              !endTime ||
              !orderDetails.customerName ||
              !orderDetails.phone ||
              loadingState
            }
            sx={{ minWidth: "120px" }}
          >
            {t("order.CompleteBook")}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddOrder;
