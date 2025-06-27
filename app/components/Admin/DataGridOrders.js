"use client";
import React, { useState, useMemo, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, Button, Stack } from "@mui/material";
import { useMainContext } from "@app/Context";
import { useTranslation } from "react-i18next";

function DataGridOrders({ cars, orders }) {
  const [orderData, setOrderData] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const { t } = useTranslation();

  useEffect(() => {
    const formattedOrders = orders.map((order, index) => {
      const startDate = order.rentalStartDate
        ? new Date(order.rentalStartDate)
        : new Date();
      const endDate = order.rentalEndDate
        ? new Date(order.rentalEndDate)
        : new Date();

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
    });

    setOrderData(formattedOrders);
  }, [orders]);

  const processOrderRowUpdate = (newRow) => {
    const updatedOrderData = orderData.map((row) =>
      row.id === newRow.id ? newRow : row
    );
    setOrderData(updatedOrderData);
    return newRow;
  };

  const orderColumns = [
    { field: "id", headerName: t("table.number"), flex: 0.5 },
    {
      field: "carModel",
      headerName: t("table.carModel"),
      //flex: 1,
      //width: 150,
      editable: true,
    },
    {
      field: "carNumber",
      headerName: t("table.carNumber"),
      //flex: 1,
      //width: 80,
      editable: true,
    },
    {
      field: "customerName",
      headerName: t("table.customer"),
      //flex: 1,
      //width: 200,
      editable: true,
    },
    {
      field: "phone",
      headerName: t("table.phone"),
      //flex: 1,
      //width: 70,
      editable: true,
    },
    {
      field: "email",
      headerName: t("table.email"),
      //flex: 1,
      //width: 200,
      editable: true,
    },
    {
      field: "rentalStartDate",
      headerName: t("table.rentStart"),
      //flex: 1,
      //width: 160,
      editable: true,
    },
    {
      field: "rentalEndDate",
      headerName: t("table.rentEnd"),
      //flex: 1,
      //width: 160,
      editable: true,
    },
    {
      field: "numberOfDays",
      headerName: t("table.days"),
      //flex: 1,
      //width: 70,
      editable: true,
    },
    {
      field: "totalPrice",
      headerName: t("table.price"),
      //flex: 1,
      //width: 130,
      editable: true,
    },
    {
      field: "confirmed",
      headerName: t("table.confirm"),
      //flex: 1,
      //width: 130,
      editable: true,
      type: "boolean",
    },
  ];

  const filterTitles = {
    all: t("print.allOrders"),
    activeToday: t("print.activOrders"),
    startingToday: t("print.startToday"),
    startingTomorrow: t("print.startTomorrow"),
    endingToday: t("print.endToday"),
    endingTomorrow: t("print.endTomorrow"),
  };

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
        className="no-print"
      >
        <Button
          variant={filterType === "all" ? "contained" : "outlined"}
          onClick={() => setFilterType("all")}
        >
          {t("table.allOrders")}
        </Button>
        <Button
          variant={filterType === "activeToday" ? "contained" : "outlined"}
          onClick={() => setFilterType("activeToday")}
        >
          {t("table.activOrders")}
        </Button>
        <Button
          variant={filterType === "startingToday" ? "contained" : "outlined"}
          onClick={() => setFilterType("startingToday")}
        >
          {t("table.startToday")}
        </Button>
        <Button
          variant={filterType === "startingTomorrow" ? "contained" : "outlined"}
          onClick={() => setFilterType("startingTomorrow")}
        >
          {t("table.startTomorrow")}
        </Button>
        <Button
          variant={filterType === "endingToday" ? "contained" : "outlined"}
          onClick={() => setFilterType("endingToday")}
        >
          {t("table.endToday")}
        </Button>
        <Button
          variant={filterType === "endingTomorrow" ? "contained" : "outlined"}
          onClick={() => setFilterType("endingTomorrow")}
        >
          {t("table.endTomorrow")}
        </Button>
      </Stack>
      <Box mb={2} className="no-print" sx={{ textAlign: "right" }}>
        <Button variant="outlined" onClick={() => window.print()}>
          {t("table.print") || "Печать"}
        </Button>
      </Box>
      <Box m={0} style={{ height: "100vh", width: "100%" }}>
        <Typography variant="h6">
          {filterTitles[filterType] || t("table.orders")}
        </Typography>
        <DataGrid
          rows={filterType === "all" ? orderData : filteredOrderData}
          columns={orderColumns}
          pageSize={20}
          processRowUpdate={processOrderRowUpdate}
          experimentalFeatures={{ newEditingApi: true }}
        />
      </Box>
    </Box>
  );
}

export default DataGridOrders;
