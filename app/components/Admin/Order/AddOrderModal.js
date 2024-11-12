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
  Snackbar,
} from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useMainContext } from "@app/Context";

const AddOrderModal = ({
  open,
  onClose,
  onSave,
  setCarOrders,
  isConflictOrder,
  setIsConflictOrder,
}) => {
  const { allOrders, fetchAndUpdateOrders } = useMainContext();
  const [newOrder, setNewOrder] = useState({
    rentalStartDate: dayjs(),
    rentalEndDate: dayjs(),
    timeIn: dayjs().utc(),
    timeOut: dayjs().utc(),
    placeIn: "",
    placeOut: "",
    customerName: "",
    phone: "",
    email: "",
    confirmed: false,
  });
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);

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

  const handleAddOrder = async () => {
    setIsUpdating(true);
    try {
      // Adjust the structure to match API requirements
      const response = await fetch("/api/order/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });

      if (!response.ok) throw new Error("Failed to add order");

      const addedOrder = await response.json();
      setCarOrders((prevOrders) => [...prevOrders, addedOrder]);
      showMessage("Order added successfully.");
      onSave(addedOrder);
      onClose();
    } catch (error) {
      console.error("Error adding order:", error);
      showMessage("Failed to add order. Please try again.", true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChange = (field, value) => {
    setNewOrder({ ...newOrder, [field]: value });
  };

  const renderField = (label, field, type = "text") => {
    let value;

    switch (type) {
      case "date":
        value = newOrder[field].format("YYYY-MM-DD");
        break;
      case "time":
        value = newOrder[field].format("HH:mm");
        break;
      default:
        value = newOrder[field];
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
          onChange={(e) => handleChange(field, e.target.value)}
          type={type}
        />
      </Box>
    );
  };

  const renderDateTimeSection = () => (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontSize: "1.2rem", backgroundColor: "secondary.light" }}
      >
        Время & Дата & Место выдачи/забора
      </Typography>
      {renderField("Rental Start Date", "rentalStartDate", "date")}
      {renderField("Rental End Date", "rentalEndDate", "date")}
      {renderField("Time In", "timeIn", "time")}
      {renderField("Time Out", "timeOut", "time")}
      {renderField("Place In", "placeIn")}
      {renderField("Place Out", "placeOut")}
    </Box>
  );

  const renderCustomerSection = () => (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontSize: "1.2rem", backgroundColor: "secondary.light" }}
      >
        Информация о клиенте
      </Typography>
      {renderField("Customer Name", "customerName")}
      {renderField("Phone", "phone")}
      {renderField("Email", "email")}
    </Box>
  );

  return (
    <Modal>
      {/* <Paper
        sx={{
          width: { xs: 500, md: 700 },
          maxWidth: "90%",
          p: { xs: 2, md: 4 },
          maxHeight: "90vh",
          overflow: "auto",
          border: isConflictOrder ? "4px solid #FF0000" : "none",
        }}
      >
        {renderDateTimeSection()}
        {renderCustomerSection()}
        <Button
          variant="contained"
          onClick={handleAddOrder}
          disabled={isUpdating}
          sx={{ width: "100%", mt: 2 }}
        >
          {isUpdating ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Добавить заказ"
          )}
        </Button>
        {updateMessage && (
          <Typography variant="body1" sx={{ mt: 1, color: "primary.main" }}>
            {updateMessage}
          </Typography>
        )}
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={updateMessage}
      /> */}
    </Modal>
  );
};

export default AddOrderModal;
