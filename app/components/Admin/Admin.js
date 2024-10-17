"use client";
import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import DataGridOrders from "./DataGridOrders";
import DataGridCars from "./DataGridCars";
import Item from "./Item";
import { Grid, Container, CircularProgress } from "@mui/material";
import { fetchAllCars } from "@utils/action";
import DefaultButton from "../common/DefaultButton";
import AddCarModal from "./AddCarModal";
import { useMainContext } from "@app/Context";
import Snackbar from "@app/components/common/Snackbar";
import Loading from "@app/loading";
import Error from "@app/error";

function Admin() {
  const { allOrders, resubmitCars, cars, fetchAndUpdateOrders } =
    useMainContext();
  const [updateStatus, setUpdateStatus] = useState(null);

  const [carsData, setCars] = useState(cars);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalAddCarOpen, setModalAddCar] = useState(false);

  const [ordersData, setOrders] = useState(allOrders);

  const fetchAndUpdateCars = async () => {
    try {
      setLoading(true);
      const fetchedCars = await fetchAllCars();
      await resubmitCars();
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

  const handleCarUpdate = async (updatedCar) => {
    setCars((prevCars) =>
      prevCars.map((car) => (car._id === updatedCar._id ? updatedCar : car))
    );
    await fetchAndUpdateCars();
  };

  const handleOrderUpdate = async (updatedOrder) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
    await fetchAndUpdateOrders();
  };

  const onCarDelete = async (response) => {
    if (response.type === 200) {
      await fetchAndUpdateCars();
      setCars((prevCars) =>
        prevCars.filter((car) => car._id !== response.data)
      );
    }

    setUpdateStatus({
      type: response.type,
      message: response.message,
    });
  };

  // Openinig/closing handlers

  const handleCloseSnackbar = () => {
    setUpdateStatus(null);
  };

  const handleAddOpen = () => {
    setModalAddCar(true);
  };
  const onModalAddCarOpen = () => {
    setModalAddCar(false);
  };

  if (loading) return <Loading />;
  if (error) return <Error />;
  return (
    <div>
      <DefaultButton relative minWidth="100%" onClick={handleAddOpen}>
        Добавить машину
      </DefaultButton>
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
                onCarDelete={onCarDelete}
              />
            </Grid>
          ))}
      </Grid>
      {updateStatus && (
        <Snackbar
          message={updateStatus.message}
          isError={Boolean(updateStatus?.type !== 200)}
          closeFunc={handleCloseSnackbar}
          open={Boolean(updateStatus)}
        />
      )}
      <AddCarModal
        open={isModalAddCarOpen}
        onClose={onModalAddCarOpen}
        car={carsData[0]}
        setUpdateStatus={setUpdateStatus}
        fetchAndUpdateCars={fetchAndUpdateCars}
      />
    </div>
  );
}

export default Admin;
