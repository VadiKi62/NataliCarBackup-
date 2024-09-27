"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchAllCars, reFetchAllOrders } from "@utils/action";

const MainContext = createContext();

export function useMainContext() {
  return useContext(MainContext);
}

export const MainContextProvider = ({ carsData, ordersData, children }) => {
  const [cars, setCars] = useState(carsData);
  const [allOrders, setAllOrders] = useState(ordersData || []);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAndUpdateOrders = async () => {
    setIsLoading(true);
    try {
      const newOrdersData = await reFetchAllOrders(); // Fetch latest orders data
      setAllOrders(newOrdersData); // Update the state with new data
      console.log("FROM FETCA AND UPDATE newOrdersData", newOrdersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAndUpdateCars = async () => {
    try {
      const newCArsData = await reFetchAllOrders();
      setCars(newCArsData);
      console.log("FROM FETCH AND UPDATE newCArsData", newCArsData);
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      console.log("cars data was updated");
    }
  };

  const ordersByCarId = (carId) => {
    return allOrders?.filter((order) => order.car === carId);
  };

  const contextValue = {
    cars,
    allOrders,
    setCars,
    setAllOrders,
    resubmitOrdersData: fetchAndUpdateOrders,
    ordersByCarId,
    isLoading,
    fetchAndUpdateCars,
  };

  return (
    <MainContext.Provider value={contextValue}>{children}</MainContext.Provider>
  );
};
