// import React, { useState } from "react";
// import {
//   Box,
//   Button,
//   Modal,
//   Typography,
//   TextField,
//   Grid,
//   Paper,
// } from "@mui/material";
// import { styled } from "@mui/material/styles";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker"; // Assuming you're using MUI DatePicker

// // Styles for the modal's container
// const StyledModalContainer = styled(Box)(({ theme }) => ({
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: "80%",
//   maxWidth: "500px",
//   backgroundColor: "white",
//   padding: theme.spacing(4),
//   borderRadius: "8px",
//   boxShadow: theme.shadows[5],
// }));

// // Calendar grid layout for date selection
// const CalendarGrid = styled(Grid)(({ theme }) => ({
//   marginTop: theme.spacing(2),
//   marginBottom: theme.spacing(2),
// }));

// function BookingModal({ open, onClose, car, presetDates = { startDate: null, endDate: null } }) {
//   const { startDate, endDate } = presetDates;
//   const [selectedStartDate, setSelectedStartDate] = useState(startDate);
//   const [selectedEndDate, setSelectedEndDate] = useState(endDate);
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");

//   const handleSubmit = () => {
//     // Handle form submission logic here
//     console.log({
//       car: car.title,
//       startDate: selectedStartDate,
//       endDate: selectedEndDate,
//       name,
//       email,
//       phone,
//     });
//     // Close the modal after submission
//     onClose();
//   };

//   return (
//     <Modal open={open} onClose={onClose}>
//       <StyledModalContainer>
//         {selectedStartDate && selectedEndDate ? (
//           <>
//             <Typography variant="h6" gutterBottom>
//               You're booking a {car.title} from {selectedStartDate.toLocaleDateString()} till {selectedEndDate.toLocaleDateString()}.
//             </Typography>
//             <Typography variant="body1" gutterBottom>
//               Please input your name, email, and phone number so we are able to get in touch with you.
//             </Typography>
//             <TextField
//               fullWidth
//               label="Name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               margin="normal"
//             />
//             <TextField
//               fullWidth
//               label="Email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               margin="normal"
//             />
//             <TextField
//               fullWidth
//               label="Phone"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//               margin="normal"
//             />
//             <Button
//               fullWidth
//               variant="contained"
//               color="primary"
//               onClick={handleSubmit}
//               sx={{ mt: 2 }}
//             >
//               Confirm Booking
//             </Button>
//           </>
//         ) : (
//           <>
//             <Typography variant="h6" gutterBottom>
//               Select your booking dates for {car.title}.
//             </Typography>
//             <CalendarGrid container spacing={2}>
//               <Grid item xs={12}>
//                 <DatePicker
//                   label="Start Date"
//                   value={selectedStartDate}
//                   onChange={(date) => setSelectedStartDate(date)}
//                   renderInput={(params) => <TextField fullWidth {...params} />}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <DatePicker
//                   label="End Date"
//                   value={selectedEndDate}
//                   onChange={(date) => setSelectedEndDate(date)}
//                   renderInput={(params) => <TextField fullWidth {...params} />}
//                 />
//               </Grid>
//             </CalendarGrid>
//             <Button
//               fullWidth
//               variant="contained"
//               color="primary"
//               onClick={() => {
//                 if (selectedStartDate && selectedEndDate) {
//                   handleSubmit();
//                 } else {
//                   alert("Please select both start and end dates.");
//                 }
//               }}
//               sx={{ mt: 2 }}
//             >
//               Set Booking Dates
//             </Button>
//           </>
//         )}
//       </StyledModalContainer>
//     </Modal>
//   );
// }

// export default BookingModal;
