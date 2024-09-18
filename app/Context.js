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

  // useEffect(() => {
  //   // Poll the database every 10 seconds for updates
  //   const intervalId = setInterval(() => {
  //     fetchAndUpdateOrders();
  //   }, 10000); // Fetch every 10 seconds (adjust as needed)

  //   return () => clearInterval(intervalId); // Clean up on component unmount
  // }, []);
  const fetchAndUpdateOrders = async () => {
    setIsLoading(true);
    try {
      const newOrdersData = await fetchAllOrders(); // Fetch latest orders data
      setAllOrders(newOrdersData); // Update the state with new data
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
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
    resubmitOrdersData: fetchAndUpdateOrders, // Reuse fetch function for manual resubmission
    ordersByCarId,
    isLoading,
  };

  return (
    <MainContext.Provider value={contextValue}>{children}</MainContext.Provider>
  );
};
