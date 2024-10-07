"use client";
import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import DataGridOrders from "./DataGridOrders";
import DataGridCars from "./DataGridCars";
import Item from "./Item";
import { Grid, Container, CircularProgress } from "@mui/material";
import { fetchAllCars } from "@utils/action";

function Admin({ session, cars, orders }) {
  const [carsData, setCars] = useState(cars);
  const [ordersData, setOrders] = useState(orders);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAndUpdateCars = async () => {
    try {
      setLoading(true);
      const fetchedCars = await fetchAllCars();
      setCars(fetchedCars);
      setError(null);
    } catch (error) {
      setError("Failed to fetch cars. Please try again later.");
      console.error("Error fetching cars:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndUpdateCars();
  }, []);

  const handleCarUpdate = (updatedCar) => {
    setCars((prevCars) =>
      prevCars.map((car) => (car._id === updatedCar._id ? updatedCar : car))
    );
  };

  const handleOrderUpdate = (updatedOrder) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  return (
    <div>
      {/* <DataGridOrders cars={cars} orders={orders} />
      <DataGridCars cars={cars} orders={orders} /> */}
      <Grid
        container
        spacing={{ sm: 2, sx: 0.4 }}
        direction="column"
        sx={{ alignItems: "center", alignContent: "center" }}
      >
        {carsData
          .sort((a, b) => a.sort - b.sort)
          .map((car) => (
            <Grid item xs={12} sx={{ padding: 2 }} key={car._id}>
              <Item
                car={car}
                onCarUpdate={handleCarUpdate}
                orders={ordersData}
                handleOrderUpdate={handleOrderUpdate}
                setOrders={setOrders}
              />
            </Grid>
          ))}
      </Grid>
    </div>
  );
}

export default Admin;
