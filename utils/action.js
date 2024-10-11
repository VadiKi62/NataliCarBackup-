import { revalidateTag } from "next/cache";
import sendEmail from "./sendEmail";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Europe/Athens");

export const API_URL =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_LOCAL_API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL;

// Fetch a single car by ID using fetch
export const fetchCar = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/car/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 404) {
      throw new Error("Car not found");
    }

    const data = await response.json();
    console.log("Fetched Car:", data);
    return data;
  } catch (error) {
    console.error("Error fetching car:", error.message);
    throw error;
  }
};

// Fetch all cars using fetch
export const fetchAll = async () => {
  try {
    const apiUrl = `${API_URL}/api/car/all`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch cars");
    }
    const carsData = await response.json();
    return carsData;
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw error;
  }
};

// Fetch all cars using fetch
export const fetchAllCars = async () => {
  try {
    const apiUrl = `${API_URL}/api/car/all`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch cars");
    }
    const carsData = await response.json();
    return carsData;
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw error;
  }
};

export const updateCar = async (updatedCar) => {
  console.log("updatedCar from action", updatedCar);
  try {
    const response = await fetch(`/api/car/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedCar),
    });

    if (!response.ok) {
      throw new Error("Failed to update car");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating car:", error);
    throw error;
  }
};

// REFetch all orders using fetch
export const reFetchAllOrders = async () => {
  try {
    const apiUrl = `${API_URL}/api/order/refetch`;
    const response = await fetch(apiUrl, {
      next: { cache: "no-store" },
      method: "POST",
      // headers: {
      //   "Content-Type": "application/json",
      // },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }
    const ordersData = await response.json();
    return ordersData;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

//Adding new order using new order api
export const addOrderNew = async (orderData) => {
  try {
    console.log(orderData);

    const response = await fetch(`${API_URL}/api/order/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();
    console.log("ADDING ORDER RESULT", result);

    if (response.ok) {
      console.log("Order added:", result);
      return { status: "success", data: result };
    } else if (response.status === 402) {
      // Non-confirmed dates conflict
      return { status: "pending", message: result.message, data: result.data };
    } else if (response.status === 409) {
      // Confirmed dates conflict
      return { status: "conflict", message: result.message };
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error occurred:", error.message);

    // Handling fetch-specific errors
    if (error.message === "Failed to fetch") {
      return { status: "error", message: "No response received from server." };
    } else {
      return {
        status: "error",
        message: error.message || "An error occurred.",
      };
    }
  }
};

// Fetch orders by car ID using fetch
export const fetchOrdersByCar = async (carId) => {
  try {
    const response = await fetch(`${API_URL}/api/order/${carId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    const orders = await response.json();
    return orders; // Return the orders data
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// Toggle active status using fetch
export const toggleIsActive = async (restId, menuNumber) => {
  try {
    const apiUrl = `${API_URL}/api/auth/toggleActive`;
    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ restId, menuNumber }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to toggle isActive status of the menu item with number ${menuNumber}`
      );
    }

    const updatedMenu = await response.json();
    return updatedMenu;
  } catch (error) {
    console.error(
      `Error toggling isActive status with rest ID ${restId} and menu number ${menuNumber}:`,
      error
    );
    throw error;
  }
};

// Fetch all orders using fetch
export const fetchAllOrders = async () => {
  try {
    const apiUrl = `${API_URL}/api/order/all?timestamp=${new Date().getTime()}`;
    const response = await fetch(apiUrl, {
      next: { cache: "no-store" },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }
    const ordersData = await response.json();
    return ordersData;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// UPDATE 1. action for changing rental dates
export const changeRentalDates = async (
  orderId,
  newStartDate,
  newEndDate,
  timeIn,
  timeOut,
  placeIn,
  placeOut
) => {
  try {
    const response = await fetch("/api/order/update/changeDates", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _id: orderId,
        rentalStartDate: newStartDate,
        rentalEndDate: newEndDate,
        timeIn: timeIn || null, // Optional fields
        timeOut: timeOut || null,
        placeIn: placeIn || null,
        placeOut: placeOut || null,
      }),
    });

    const data = await response.json();

    if (response.status === 200) {
      // Handle success, no conflicts
      console.log("Заказ обновлен!:", data.message);
      return {
        status: 200,
        message: data.message,
        updatedOrder: data.data,
      };
    } else if (response.status === 201) {
      // Handle non-confirmed conflict dates (partial update)
      console.log("Заказ обновлен но с non-confirmed conflicts:", data);
      return {
        status: 201,
        message: data.message,
        conflicts: data.data.nonConfirmedOrders,
        updatedOrder: data.data.updatedOrder,
      };
    } else if (response.status === 300) {
      // Handle confirmed conflict dates (no update)
      console.log("Confirmed conflicting dates:", data);
      return {
        status: 300,
        message: data.message,
        conflicts: data.confirmedOrders,
      };
    } else {
      // Handle unexpected responses
      console.error("Unexpected response:", data);
      return {
        status: response.status,
        message: data.message || "Unexpected response",
        data: data,
      };
    }
  } catch (error) {
    // Handle fetch or server errors
    console.error("Error updating order:", error);
    return {
      status: 500,
      message: "Error updating order: " + error.message,
    };
  }
};

// UPDATE 2.  action for switching confirmed status
export const toggleConfirmedStatus = async (orderId) => {
  try {
    const response = await fetch(`/api/order/update/switchConfirm/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.status === 200) {
      console.log("Order confirmation status updated:", data);
      return { updatedOrder: data.data, message: data.message };
    }
  } catch (error) {
    console.error("Error updating confirmation status:", error);
    return error;
  }
};

// UPDATE 3.  action for changing customer information
export const updateCustomerInfo = async (orderId, updateData) => {
  const response = await fetch("/api/order/update/customer", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      _id: orderId,
      phone: updateData.phone,
      email: updateData.email,
      customerName: updateData.customerName,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update customer information");
  }

  return await response.json();
};
