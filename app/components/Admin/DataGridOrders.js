"use client";
import React, { useState, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, Button, Stack } from "@mui/material";
import { useMainContext } from "@app/Context";

function DataGridOrders({ cars, orders }) {
  // Prepare order data with formatted dates and robust date handling
  const orderData = useMemo(
    () =>
      orders.map((order, index) => {
        // Safely convert dates, with fallback values
        const startDate = order.rentalStartDate
          ? new Date(order.rentalStartDate)
          : new Date(); // Default to current date if undefined
        const endDate = order.rentalEndDate
          ? new Date(order.rentalEndDate)
          : new Date(); // Default to current date if undefined

        return {
          id: index + 1,
          customerName: order.customerName,
          phone: order.phone,
          carNumber: order.carNumber,
          email: order.email,
          rentalStartDate: startDate.toLocaleDateString(),
          rentalEndDate: endDate.toLocaleDateString(),
          originalStartDate: startDate,
          originalEndDate: endDate,
          numberOfDays: order.numberOfDays,
          totalPrice: order.totalPrice,
          carModel: order.carModel,
          confirmed: order.confirmed,
        };
      }),
    [orders]
  );
  // Handle the edit process for order data
  const processOrderRowUpdate = (newRow) => {
    const updatedOrderData = orderData.map((row) =>
      row.id === newRow.id ? newRow : row
    );
    setOrderData(updatedOrderData);
    return newRow; // Required to reflect changes in the UI
  };

  // Define the columns for the orders data with editable fields
  const orderColumns = [
    { field: "id", headerName: "ID", width: 40 },
    { field: "carModel", headerName: "Car Model", width: 150, editable: true },
    {
      field: "carNumber",
      headerName: "Car Number",
      width: 80,
      editable: true,
    },
    {
      field: "customerName",
      headerName: "Customer",
      width: 200,
      editable: true,
    },
    { field: "phone", headerName: "Phone", width: 70, editable: true },
    { field: "email", headerName: "Email", width: 200, editable: true },
    {
      field: "rentalStartDate",
      headerName: "Rental Start",
      width: 160,
      editable: true,
    },
    {
      field: "rentalEndDate",
      headerName: "Rental End",
      width: 160,
      editable: true,
    },
    { field: "numberOfDays", headerName: "Days", width: 70, editable: true },
    {
      field: "totalPrice",
      headerName: "Total Price",
      width: 130,
      editable: true,
    },

    {
      field: "confirmed",
      headerName: "Confirmed",
      width: 130,
      editable: true,
      type: "boolean",
    },
  ];
  const [filterType, setFilterType] = useState("all");
  // Filtered orders based on selected filter
  // Filtered orders based on selected filter
  const filteredOrderData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (filterType) {
      case "activeToday":
        return orderData.filter((order) => {
          try {
            return (
              order.originalStartDate <= today && order.originalEndDate >= today
            );
          } catch (error) {
            console.error("Error filtering active today:", error, order);
            return false;
          }
        });
      case "startingToday":
        return orderData.filter((order) => {
          try {
            return (
              order.originalStartDate &&
              order.originalStartDate.toDateString() === today.toDateString()
            );
          } catch (error) {
            console.error("Error filtering starting today:", error, order);
            return false;
          }
        });
      case "startingTomorrow":
        return orderData.filter((order) => {
          try {
            return (
              order.originalStartDate &&
              order.originalStartDate.toDateString() === tomorrow.toDateString()
            );
          } catch (error) {
            console.error("Error filtering starting tomorrow:", error, order);
            return false;
          }
        });
      case "endingToday":
        return orderData.filter((order) => {
          try {
            return (
              order.originalEndDate &&
              order.originalEndDate.toDateString() === today.toDateString()
            );
          } catch (error) {
            console.error("Error filtering ending today:", error, order);
            return false;
          }
        });
      case "endingTomorrow":
        return orderData.filter((order) => {
          try {
            return (
              order.originalEndDate &&
              order.originalEndDate.toDateString() === tomorrow.toDateString()
            );
          } catch (error) {
            console.error("Error filtering ending tomorrow:", error, order);
            return false;
          }
        });
      default:
        return orderData;
    }
  }, [orderData, filterType]);

  return (
    <Box pt={6}>
      <Stack
        direction="row"
        spacing={2}
        pb={0}
        sx={{
          flexWrap: "wrap",
          gap: 1,
          justifyContent: "center",
        }}
      >
        <Button
          variant={filterType === "all" ? "contained" : "outlined"}
          onClick={() => setFilterType("all")}
        >
          Show All Orders
        </Button>
        <Button
          variant={filterType === "activeToday" ? "contained" : "outlined"}
          onClick={() => setFilterType("activeToday")}
        >
          Active (without past)
        </Button>
        <Button
          variant={filterType === "startingToday" ? "contained" : "outlined"}
          onClick={() => setFilterType("startingToday")}
        >
          Starting Today
        </Button>
        <Button
          variant={filterType === "startingTomorrow" ? "contained" : "outlined"}
          onClick={() => setFilterType("startingTomorrow")}
        >
          Starting Tomorrow
        </Button>
        <Button
          variant={filterType === "endingToday" ? "contained" : "outlined"}
          onClick={() => setFilterType("endingToday")}
        >
          Ending Today
        </Button>
        <Button
          variant={filterType === "endingTomorrow" ? "contained" : "outlined"}
          onClick={() => setFilterType("endingTomorrow")}
        >
          Ending Tomorrow
        </Button>
      </Stack>
      {/* DataGrid for Orders with Editable Columns */}
      <Box m={0} style={{ height: "100vh", width: "100%" }}>
        <Typography variant="h6">Orders</Typography>
        <DataGrid
          rows={filterType === "all" ? orderData : filteredOrderData}
          columns={orderColumns}
          pageSize={20}
          processRowUpdate={processOrderRowUpdate}
          experimentalFeatures={{ newEditingApi: true }} // Required for editing functionality
        />
      </Box>
    </Box>
  );
}

export default DataGridOrders;
