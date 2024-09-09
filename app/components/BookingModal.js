// import React, { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   Typography,
//   Box,
//   Alert,
// } from "@mui/material";
// import { styled } from "@mui/material/styles";
// import dayjs from "dayjs";
// import { addOrder } from "@utils/action";

// Styled form container
// const FormContainer = styled(Box)(({ theme }) => ({
//   display: "flex",
//   flexDirection: "column",
//   gap: theme.spacing(2),
//   marginTop: theme.spacing(2),
// }));

// // Booking modal component
// function BookingModal({ open, onClose, car, presetDates = null }) {
//   const [startDate, setStartDate] = useState(presetDates?.startDate || null);
//   const [endDate, setEndDate] = useState(presetDates?.endDate || null);
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");

//   const handleDateChange = (dateRange) => {
//     setStartDate(dateRange[0]);
//     setEndDate(dateRange[1]);
//   };

//   const handleSubmit = () => {
//     // Handle form submission
//     console.log({ car, startDate, endDate, name, email, phone });
//     onClose(); // Close the modal after submission
//   };

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
//       <DialogTitle>Book {car.model}</DialogTitle>
//       <DialogContent>
//         {presetDates ? (
//           <>
//             <Typography variant="body1">
//               You are booking a {car.model} from{" "}
//               <span style={{ color: "red" }}>
//                 {dayjs(presetDates.startDate).format("MMMM D")}
//               </span>{" "}
//               till{" "}
//               <span style={{ color: "red" }}>
//                 {dayjs(presetDates.endtDate).format("MMMM D")}
//               </span>
//               . Please input your name, email, and phone number so we can get in
//               touch with you.
//             </Typography>
//             <FormContainer>
//               <TextField
//                 label="Name"
//                 variant="outlined"
//                 fullWidth
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//               />
//               <TextField
//                 label="Email"
//                 variant="outlined"
//                 fullWidth
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//               <TextField
//                 label="Phone Number"
//                 variant="outlined"
//                 fullWidth
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//               />
//             </FormContainer>
//           </>
//         ) : (
//           <>
//             <Typography variant="body1">
//               Please select your booking dates for the {car.title}:
//             </Typography>
//             {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
//               <DateRangePicker
//                 startText="Start Date"
//                 endText="End Date"
//                 value={[startDate, endDate]}
//                 onChange={handleDateChange}
//                 calendars={2} // Displays 2 months side by side
//                 renderInput={(startProps, endProps) => (
//                   <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
//                     <TextField {...startProps} fullWidth />
//                     <TextField {...endProps} fullWidth />
//                   </Box>
//                 )}
//               />
//             </LocalizationProvider> */}
//             <FormContainer>
//               <TextField
//                 label="Name"
//                 variant="outlined"
//                 fullWidth
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//               />
//               <TextField
//                 label="Email"
//                 variant="outlined"
//                 fullWidth
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//               <TextField
//                 label="Phone Number"
//                 variant="outlined"
//                 fullWidth
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//               />
//             </FormContainer>
//           </>
//         )}
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose}>Cancel</Button>
//         <Button variant="contained" color="primary" onClick={handleSubmit}>
//           Confirm Booking
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
} from "@mui/material";
import { addOrder } from "@utils/action";
import SuccessMessage from "./common/SuccessMessage";

const BookingModal = ({ open, onClose, car, presetDates = null }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false); // New state to handle submission status

  useEffect(() => {
    if (presetDates?.startDate && presetDates?.endDate && car.pricePerDay) {
      const days =
        dayjs(presetDates.endDate).diff(dayjs(presetDates.startDate), "day") +
        1;
      setTotalPrice(days * car.pricePerDay);
    }
  }, [presetDates?.startDate, presetDates?.endDate, car.pricePerDay]);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhone = (phone) => {
    const re = /^\+?[1-9]\d{1,14}$/;
    return re.test(phone);
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!name) newErrors.name = "Name is required";
    if (!validateEmail(email)) newErrors.email = "Invalid email address";
    if (!validatePhone(phone)) newErrors.phone = "Invalid phone number";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const orderData = {
        carNumber: car.carNumber,
        customerName: name,
        phone,
        email,
        rentalStartDate: presetDates.startDate,
        rentalEndDate: presetDates.endDate,
        totalPrice,
      };

      const result = await addOrder(orderData);
      console.log("Order added successfully:", result);
      setIsSubmitted(true); // Mark submission as successful
    } catch (error) {
      console.error("Error adding order:", error.message);
      setErrors({ submit: "Failed to submit order. Please try again." });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isSubmitted ? "Booking Confirmed!" : `Book ${car.model}`}
      </DialogTitle>
      <DialogContent>
        {isSubmitted ? (
          <SuccessMessage
            car={car}
            presetDates={presetDates}
            onClose={onClose}
          />
        ) : (
          <Box>
            <Typography variant="body1">
              You are booking {car.model} from{" "}
              <Box
                component="span"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                {dayjs(presetDates?.startDate).format("MMMM D")}
              </Box>{" "}
              till{" "}
              <Box
                component="span"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                {dayjs(presetDates?.endDate).format("MMMM D")}
              </Box>
              .
            </Typography>
            <Typography
              variant="h6"
              sx={{ mt: 2, mb: 2, fontWeight: "bold", color: "primary.red" }}
            >
              Total Price: ${totalPrice}
            </Typography>
            <Box component="form" sx={{ "& .MuiTextField-root": { my: 1 } }}>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                error={!!errors.name}
                helperText={errors.name}
              />
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                error={!!errors.email}
                helperText={errors.email}
              />
              <TextField
                label="Phone Number"
                variant="outlined"
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Box>
            {errors.submit && (
              <Typography color="error" sx={{ mt: 2 }}>
                {errors.submit}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{isSubmitted ? "OK" : "Cancel"}</Button>
        {!isSubmitted && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={
              !name ||
              !email ||
              !phone ||
              !presetDates?.startDate ||
              !presetDates?.endDate
            }
          >
            Confirm Booking
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BookingModal;
