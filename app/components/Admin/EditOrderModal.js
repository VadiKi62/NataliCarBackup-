import React, { useState, useEffect } from "react";
import {
  Modal,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import ConflictMessage from "./conflictMessage";
import Snackbar from "@app/components/common/Snackbar";
import { useMainContext } from "@app/Context";
import { functionToCheckDuplicates } from "@utils/functions";

import {
  changeRentalDates,
  toggleConfirmedStatus,
  updateCustomerInfo,
} from "@utils/action";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone
const timeZone = "Europe/Athens";
dayjs.tz.setDefault(timeZone);

const EditOrderModal = ({ open, onClose, order, onSave }) => {
  const { allOrders } = useMainContext();
  const [editedOrder, setEditedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conflictMessage1, setConflictMessage1] = useState(null);
  const [conflictMessage2, setConflictMessage2] = useState(null);
  const [conflictMessage3, setConflictMessage3] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (order) {
      // Convert dates to the correct timezone when setting initial state
      const adjustedOrder = {
        ...order,
        rentalStartDate: dayjs(order.rentalStartDate),
        rentalEndDate: dayjs(order.rentalEndDate),
        timeIn: dayjs(order.timeIn).utc(),
        timeOut: dayjs(order.timeOut).utc(),
      };
      setEditedOrder(adjustedOrder);

      if (order.hasConflictDates.length > 0) {
        const conflictingOrderIds = new Set(order.hasConflictDates);
        const conflicts = allOrders.filter((existingOrder) =>
          conflictingOrderIds.has(existingOrder._id)
        );

        setConflictMessage3(conflicts); // Set the conflicting orders
      }

      setLoading(false);
    }
  }, [order]);

  const onCloseModalEdit = () => {
    onClose();
    setConflictMessage2(null);
    setConflictMessage1(null);
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setUpdateMessage(null);
  };

  const showMessage = (message, isError = false) => {
    setUpdateMessage(message);
    setSnackbarOpen(true);
    if (!isError) {
      setTimeout(() => {
        setSnackbarOpen(false);
        setUpdateMessage(null);
      }, 3000);
    }
  };

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);

  const handleConfirmationToggle = async () => {
    setIsUpdating(true);
    setUpdateMessage(null);
    try {
      const { updatedOrder, message } = await toggleConfirmedStatus(
        editedOrder._id
      );

      setEditedOrder((prevOrder) => ({
        ...prevOrder,
        confirmed: updatedOrder?.confirmed,
      }));

      showMessage(message);
      onSave(updatedOrder);
    } catch (error) {
      console.error("Error toggling confirmation status:", error);
      setUpdateMessage(error.message || "Статус не обновлен. Ошибка сервера.");
    } finally {
      setIsUpdating(false);
    }
  };
  const handleDateUpdate = async () => {
    setIsUpdating(true);
    try {
      const datesToSend = {
        rentalStartDate: dayjs(editedOrder.rentalStartDate).toDate(),
        rentalEndDate: dayjs(editedOrder.rentalEndDate).toDate(),
        timeIn: editedOrder.timeIn,
        timeOut: editedOrder.timeOut,
      };

      const response = await changeRentalDates(
        editedOrder._id,
        datesToSend.rentalStartDate,
        datesToSend.rentalEndDate,
        datesToSend.timeIn,
        datesToSend.timeOut,
        editedOrder.placeIn,
        editedOrder.placeOut
      );
      console.log("RESPONSE", response);
      showMessage(response.message);
      if (response.status == 201) {
        setConflictMessage1(response.conflicts);
        onSave(response.updatedOrder);
      }
      if (response.status == 300) {
        setConflictMessage2(response.conflicts);
      }
      if (response.status == 200) {
        onSave(response.updatedOrder);
      }
    } catch (error) {
      console.error("Error updating dates:", error);
      setUpdateMessage("Failed to update date details.");
    } finally {
      setIsUpdating(false);
    }
  };
  const handleCustomerUpdate = async () => {
    setIsUpdating(true);
    try {
      const updates = {
        customerName: editedOrder.customerName,
        phone: editedOrder.phone,
        email: editedOrder.email,
      };

      const response = await updateCustomerInfo(editedOrder._id, updates);
      showMessage(response.message);
      onSave(response.updatedOrder);
    } catch (error) {
      console.error("Error updating customer info:", error);
      setUpdateMessage("Failed to update customer details.");
    } finally {
      setIsUpdating(false);
    }
  };
  const handleChange = (field, value) => {
    let newValue = value;

    if (field === "rentalStartDate" || field === "rentalEndDate") {
      // Check if the value is valid and in 'YYYY-MM-DD' format for dates
      const isValidDate = dayjs(value, "YYYY-MM-DD", true).isValid();
      if (isValidDate) {
        newValue = dayjs(value);

        // Adjust timeIn and timeOut when rentalStartDate or rentalEndDate is changed
        if (field === "rentalStartDate") {
          newValue = newValue
            .hour(dayjs(editedOrder?.timeIn).hour())
            .minute(dayjs(editedOrder?.timeIn).minute());
        } else if (field === "rentalEndDate") {
          newValue = newValue
            .hour(dayjs(editedOrder?.timeOut).hour())
            .minute(dayjs(editedOrder?.timeOut).minute());
        }
      } else {
        console.error("Invalid date format");
        return; // Skip if the date format is invalid
      }
    }

    if (field === "timeIn" || field === "timeOut") {
      // Check if the value is valid and in 'HH:mm' format for times
      const isValidTime = dayjs(value, "HH:mm", true).isValid();
      if (isValidTime) {
        if (field === "timeIn") {
          // Set timeIn, but apply it to the rentalStartDate
          newValue = dayjs(editedOrder.rentalStartDate)
            .utc()
            .hour(dayjs(value, "HH:mm").hour())
            .minute(dayjs(value, "HH:mm").minute());
        } else if (field === "timeOut") {
          // Set timeOut, but apply it to the rentalEndDate
          newValue = dayjs(editedOrder.rentalEndDate)
            .utc()
            .hour(dayjs(value, "HH:mm").hour())
            .minute(dayjs(value, "HH:mm").minute());
        }
      } else {
        console.error("Invalid time format");
        return; // Skip if the time format is invalid
      }
    }

    setEditedOrder({ ...editedOrder, [field]: newValue });
  };
  const renderField = (label, field, type = "text") => {
    if (!editedOrder) return null;

    let inputType = type;
    let value;

    switch (type) {
      case "date":
        value = editedOrder[field].format("YYYY-MM-DD");
        inputType = "date";
        break;
      case "time":
        value = editedOrder[field].format("HH:mm");
        inputType = "time";
        break;
      case "boolean":
        value = editedOrder[field] ? "Yes" : "No";
        inputType = "checkbox";
        break;
      default:
        value = editedOrder[field];
    }

    return (
      <Box sx={{ mb: 1 }}>
        <Typography
          variant="body2"
          component="span"
          sx={{ fontWeight: "bold", mr: 1 }}
        >
          {label}:
        </Typography>
        <TextField
          size="small"
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            handleChange(field, newValue); // Pass the value to handleChange
          }}
          type={inputType}
        />
      </Box>
    );
  };

  const renderDateTimeSection = () => (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          lineHeight: "1.4rem",
          fontSize: "1.2rem",
          backgroundColor: "secondary.light",
        }}
      >
        Время & Дата & Место выдачи/забора
      </Typography>
      {renderField("Rental Start Date", "rentalStartDate", "date")}
      {renderField("Rental End Date", "rentalEndDate", "date")}
      {renderField("Time In", "timeIn", "time")}
      {renderField("Time Out", "timeOut", "time")}
      {renderField("Place In", "placeIn")}
      {renderField("Place Out", "placeOut")}
      <Typography variant="body2" sx={{ fontWeight: "bold", mr: 1 }}>
        Всего цена : {editedOrder?.totalPrice}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: "bold", mr: 1 }}>
        Кол-во дней : {editedOrder?.numberOfDays}
      </Typography>
    </Box>
  );

  const renderCustomerSection = () => (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          lineHeight: "1.4rem",
          fontSize: "1.2rem",
          backgroundColor: "secondary.light",
        }}
      >
        Информация о клиенте
      </Typography>
      {renderField("Customer Name", "customerName")}
      {renderField("Phone", "phone")}
      {renderField("Email", "email")}
    </Box>
  );

  const renderConfirmationSection = () => (
    <Box sx={{ mb: 3 }}>
      <Button
        variant="contained"
        onClick={handleConfirmationToggle}
        disabled={isUpdating}
        sx={{
          width: "100%",
          backgroundColor: editedOrder?.confirmed
            ? "text.green"
            : "primary.main",
          color: editedOrder?.confirmed ? "black" : "white",
          "&:hover": {
            backgroundColor: editedOrder?.confirmed ? "darkgreen" : "darkred",
            color: "white",
          },
        }}
      >
        {isUpdating ? (
          <CircularProgress size={24} color="inherit" />
        ) : editedOrder?.confirmed ? (
          "Заказ подтвержден."
        ) : (
          "Заказ не подтвержден. "
        )}
      </Button>
      {updateMessage && (
        <Typography
          varian="body1"
          sx={{ mt: 1, color: "primary.main", lineHeight: "1rem" }}
        >
          {updateMessage}
        </Typography>
      )}
    </Box>
  );

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Paper
          sx={{
            width: { xs: 500, md: 700 },
            maxWidth: "90%",
            p: { xs: 2, md: 4 },
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Typography variant="h5" gutterBottom>
                Edit Order for {order?.carModel}
              </Typography>
              {/* <Divider sx={{ my: 2 }} /> */}
              <Box
                display="flex"
                alignContent="center"
                alignItems="center"
                justifyContent="right"
              >
                <Typography variant="body1" sx={{ alignSelf: "center" }}>
                  Total Price: {editedOrder?.totalPrice} | Days:{" "}
                  {editedOrder?.numberOfDays}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleConfirmationToggle}
                  disabled={isUpdating}
                  sx={{
                    width: "100%",
                    backgroundColor: editedOrder?.confirmed
                      ? "text.green"
                      : "text.red",
                  }}
                >
                  {editedOrder?.confirmed
                    ? "Заказ подтвержден"
                    : "Заказ не подтвержден"}
                </Button>
              </Box>

              <Box sx={{ mb: 3 }}>
                {renderField("Rental Start Date", "rentalStartDate", "date")}
                {renderField("Rental End Date", "rentalEndDate", "date")}
                {renderField("Time In", "timeIn", "time")}
                {renderField("Time Out", "timeOut", "time")}
                {renderField("Place In", "placeIn")}
                {renderField("Place Out", "placeOut")}
                <Button
                  variant="contained"
                  onClick={handleDateUpdate}
                  disabled={isUpdating}
                  sx={{ mt: 2 }}
                >
                  Update Rental Details
                </Button>
                {conflictMessage1 && (
                  <ConflictMessage
                    initialConflicts={conflictMessage1}
                    setUpdateMessage={setUpdateMessage}
                    type={1}
                  />
                )}
                {conflictMessage2 && (
                  <ConflictMessage
                    initialConflicts={conflictMessage2}
                    setUpdateMessage={setUpdateMessage}
                    type={2}
                  />
                )}

                {conflictMessage3 && (
                  <ConflictMessage
                    initialConflicts={conflictMessage3}
                    setUpdateMessage={setUpdateMessage}
                    type={3}
                  />
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Customer Information
                </Typography>
                {renderField("Customer Name", "customerName")}
                {renderField("Phone", "phone")}
                {renderField("Email", "email")}
                <Button
                  variant="contained"
                  onClick={handleCustomerUpdate}
                  disabled={isUpdating}
                  sx={{ mt: 2 }}
                >
                  Update Customer Info
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
              >
                <Button onClick={onCloseModalEdit} variant="outlined">
                  Cancel
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Modal>
      <Snackbar
        open={snackbarOpen}
        message={updateMessage}
        closeFunc={handleSnackbarClose}
        isError={
          updateMessage && updateMessage.toLowerCase().includes("failed")
        }
      />
    </>
  );
};

export default EditOrderModal;

// import React, { useState, useEffect } from "react";
// import {
//   Modal,
//   Paper,
//   Box,
//   Typography,
//   TextField,
//   Button,
//   CircularProgress,
// } from "@mui/material";
// import dayjs from "dayjs";

// const EditOrderModal = ({ open, onClose, order, onSave }) => {
//   const [editMode, setEditMode] = useState({});
//   const [editedOrder, setEditedOrder] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (order) {
//       setEditedOrder(order);
//       setLoading(false);
//     }
//   }, [order]);

//   const handleDoubleClick = (field) => {
//     setEditMode({ ...editMode, [field]: true });
//   };

//   const handleChange = (field, value) => {
//     setEditedOrder({ ...editedOrder, [field]: value });
//   };

//   const handleSave = () => {
//     onSave(editedOrder);
//     setEditMode({});
//   };

//   const renderField = (label, field, type = "text") => {
//     if (!editedOrder) return null;

//     return (
//       <Box onDoubleClick={() => handleDoubleClick(field)} sx={{ mb: 1 }}>
//         <Typography
//           variant="body2"
//           component="span"
//           sx={{ fontWeight: "bold", mr: 1 }}
//         >
//           {label}:
//         </Typography>
//         {editMode[field] ? (
//           <TextField
//             size="small"
//             value={editedOrder[field] || ""}
//             onChange={(e) => handleChange(field, e.target.value)}
//             type={type}
//           />
//         ) : (
//           <Typography variant="body2" component="span">
//             {type === "date"
//               ? dayjs(editedOrder[field]).format("DD-MM-YYYY")
//               : type === "boolean"
//               ? editedOrder[field]
//                 ? "Yes"
//                 : "No"
//               : editedOrder[field]}
//           </Typography>
//         )}
//       </Box>
//     );
//   };

//   return (
//     <Modal
//       open={open}
//       onClose={onClose}
//       sx={{
//         display: "flex",
//         alignContent: "center",
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <Paper
//         sx={{
//           width: 400,
//           maxWidth: "90%",
//           p: 4,
//           margin: "auto",
//           maxHeight: "90vh",
//           overflow: "auto",
//         }}
//       >
//         {loading ? (
//           <Box>
//             <CircularProgress />
//             <CircularProgress />
//             <CircularProgress />
//           </Box>
//         ) : (
//           <>
//             <Typography variant="h6" gutterBottom>
//               Booking Details (Double-click to edit)
//             </Typography>
//             {renderField("Customer Name", "customerName")}
//             {renderField("Car Number", "carNumber")}
//             {renderField("Confirmed", "confirmed", "boolean")}
//             {renderField("Has Conflict Dates", "hasConflictDates", "boolean")}
//             {renderField("Phone", "phone")}
//             {renderField("Email", "email")}
//             {renderField("Rental Start Date", "rentalStartDate", "date")}
//             {renderField("Rental End Date", "rentalEndDate", "date")}
//             {renderField("Number of Days", "numberOfDays", "number")}
//             {renderField("Total Price", "totalPrice", "number")}
//             {renderField("Car Model", "carModel")}
//             {renderField("Car ID", "car")}
//             {renderField("Date Created", "date", "date")}
//             <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
//               <Button onClick={handleSave} variant="contained" color="primary">
//                 Save Changes
//               </Button>
//             </Box>
//           </>
//         )}
//       </Paper>
//     </Modal>
//   );
// };

// export default EditOrderModal;
