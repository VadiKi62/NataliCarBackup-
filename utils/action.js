import { revalidateTag } from "next/cache";
import sendEmail from "./sendEmail";

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

// action for changing rental dates
export const changeRentalDates = async (orderId, newStartDate, newEndDate) => {
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
      }),
    });

    const data = await response.json();

    if (response.status === 200) {
      // handle success (no conflicts)
      console.log("Order updated successfully:", data);
    } else if (response.status === 201) {
      // handle non-confirmed conflict dates
      console.log(
        "Order updated but pending confirmation on some dates:",
        data
      );
    } else if (response.status === 300) {
      // handle confirmed conflict dates
      console.log("Conflicting confirmed dates:", data);
    } else {
      console.error("Unexpected response:", data);
    }
  } catch (error) {
    console.error("Error updating order:", error);
  }
};

// action for switching confirmed status
export const toggleConfirmedStatus = async (orderId) => {
  try {
    const response = await fetch("/api/orders/update/switchConfirm", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _id: orderId,
      }),
    });

    const data = await response.json();

    if (response.status === 200) {
      console.log("Order confirmation status updated:", data);
    } else {
      console.error("Failed to update confirmation status:", data);
    }
  } catch (error) {
    console.error("Error updating confirmation status:", error);
  }
};

// action for changing customer information
export const updateCustomerInfo = async (
  orderId,
  newName,
  newEmail,
  newPhone
) => {
  try {
    const response = await fetch("/api/orders/update/customer", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _id: orderId,
        customerName: newName,
        email: newEmail,
        phone: newPhone,
      }),
    });

    const data = await response.json();

    if (response.status === 200) {
      console.log("Customer information updated:", data);
    } else {
      console.error("Failed to update customer information:", data);
    }
  } catch (error) {
    console.error("Error updating customer information:", error);
  }
};
