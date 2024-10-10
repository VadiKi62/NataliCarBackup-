"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Modal,
  Paper,
} from "@mui/material";

import { customers } from "./customers.js";
import CustomerCard from "./CustomerCard.js";

const App = () => {
  const [addedCustomers, setAddedCustomers] = useState([]);
  const [buttonMessage, setButtonMessage] = useState("Add all at once");

  const addNewCustomer = () => {
    if (addedCustomers.length < 1) {
      setAddedCustomers([customers[0]]);
    } else {
      const notAdded = customers.filter(
        (c) => !addedCustomers.some((added) => added.id === c.id)
      );

      if (notAdded.length > 0) {
        setAddedCustomers([...addedCustomers, notAdded[0]]);
      } else {
        console.log("All customers have already been added");
      }
    }
  };

  const addAllInOnce = () => {
    if (addedCustomers.length < 1) {
      setAddedCustomers(customers);
      setButtonMessage("Remove All");
    } else {
      setAddedCustomers([]);
      setButtonMessage("Add all at once");
    }
  };

  return (
    <main>
      <Box>
        <h2>Add a new customer</h2>
        <button onClick={addAllInOnce} style={{ marginRight: "10px" }}>
          {buttonMessage}
        </button>
        <button onClick={addNewCustomer}>Add Customer</button>
        <h2>Customers</h2>
        <Paper>
          {addedCustomers.length > 0 &&
            addedCustomers?.map((customerToAdd) => (
              <div key={customerToAdd?.id}>
                <CustomerCard customer={customerToAdd} />
              </div>
            ))}
        </Paper>
      </Box>
    </main>
  );
};

export default App;
