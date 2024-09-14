"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchAllOrders } from "@utils/action";

const MainContext = createContext();

export function useMainContext() {
  return useContext(MainContext);
}

export const MainContextProvider = ({ carsData, ordersData, children }) => {
  const [cars, setCars] = useState(carsData);
  const [allOrders, setAllOrders] = useState(ordersData || []);
  const [isLoading, setIsLoading] = useState(false);

  const resubmitOrdersData = async () => {
    console.log("resubmitORDERSSSSSS1");
    setIsLoading(true); // Start loading
    const newOrdersData = await fetchAllOrders(); // Await the new data
    console.log("!!_!_!_!__!_!____!_!__!_resubmitORDERSSSSSS22222!!!!");
    setAllOrders(newOrdersData); // Update orders state
    setIsLoading(false); // Stop loading
  };

  const ordersByCarId = (carId) => {
    return allOrders?.filter((order) => order.car == carId);
  };

  const contextValue = {
    cars,
    allOrders,
    setCars,
    setAllOrders,
    resubmitOrdersData,
    ordersByCarId,
    isLoading,
  };
  return (
    <MainContext.Provider value={contextValue}>{children}</MainContext.Provider>
  );
};
