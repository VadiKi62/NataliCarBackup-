import React, { useState, useEffect } from "react";
import {
  Modal,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import dayjs from "dayjs";

const EditOrderModal = ({ open, onClose, order, onSave }) => {
  const [editMode, setEditMode] = useState({});
  const [editedOrder, setEditedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (order) {
      setEditedOrder(order);
      setLoading(false);
    }
  }, [order]);

  const handleDoubleClick = (field) => {
    setEditMode({ ...editMode, [field]: true });
  };

  const handleChange = (field, value) => {
    setEditedOrder({ ...editedOrder, [field]: value });
  };

  const handleSave = () => {
    onSave(editedOrder);
    setEditMode({});
  };

  const renderField = (label, field, type = "text") => {
    if (!editedOrder) return null;

    return (
      <Box onDoubleClick={() => handleDoubleClick(field)} sx={{ mb: 1 }}>
        <Typography
          variant="body2"
          component="span"
          sx={{ fontWeight: "bold", mr: 1 }}
        >
          {label}:
        </Typography>
        {editMode[field] ? (
          <TextField
            size="small"
            value={editedOrder[field] || ""}
            onChange={(e) => handleChange(field, e.target.value)}
            type={type}
          />
        ) : (
          <Typography variant="body2" component="span">
            {type === "date"
              ? dayjs(editedOrder[field]).format("DD-MM-YYYY")
              : type === "boolean"
              ? editedOrder[field]
                ? "Yes"
                : "No"
              : editedOrder[field]}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignContent: "center",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper
        sx={{
          width: 400,
          maxWidth: "90%",
          p: 4,
          margin: "auto",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        {loading ? (
          <Box>
            <CircularProgress />
            <CircularProgress />
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Booking Details (Double-click to edit)
            </Typography>
            {renderField("Customer Name", "customerName")}
            {renderField("Car Number", "carNumber")}
            {renderField("Confirmed", "confirmed", "boolean")}
            {renderField("Has Conflict Dates", "hasConflictDates", "boolean")}
            {renderField("Phone", "phone")}
            {renderField("Email", "email")}
            {renderField("Rental Start Date", "rentalStartDate", "date")}
            {renderField("Rental End Date", "rentalEndDate", "date")}
            {renderField("Number of Days", "numberOfDays", "number")}
            {renderField("Total Price", "totalPrice", "number")}
            {renderField("Car Model", "carModel")}
            {renderField("Car ID", "car")}
            {renderField("Date Created", "date", "date")}
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={handleSave} variant="contained" color="primary">
                Save Changes
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Modal>
  );
};

export default EditOrderModal;
