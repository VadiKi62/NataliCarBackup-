import axios from "axios";

export const API_URL =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_LOCAL_API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL;

// Fetch a single car by ID using axios
export const fetchCar = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/car/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 404) {
      throw new Error("Car not found");
    }

    console.log("Fetched Car:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching car:", error.message);
    throw error;
  }
};

// Fetch all cars using axios
export const fetchAll = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/car/all`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw error;
  }
};

// Fetch all orders using axios
export const fetchAllOrders = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/order/all`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// Add an order using axios
export const addOrder = async (orderData) => {
  try {
    const response = await axios.post(`${API_URL}/api/order/add`, orderData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Order added:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(
        `Server error: ${error.response.status} - ${error.response.data}`
      );
      throw new Error(
        `Server error: ${error.response.status} - ${error.response.data}`
      );
    } else {
      console.error("Error adding order:", error.message);
      throw error;
    }
  }
};

// Fetch orders by car ID using axios
export const fetchOrdersByCar = async (carId) => {
  try {
    const response = await axios.get(`${API_URL}/api/order/${carId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching orders by car:", error);
    throw error;
  }
};

// Batch fetch car and order data concurrently
export const fetchCarAndOrders = async (carId) => {
  try {
    const [carData, ordersData] = await Promise.all([
      fetchCar(carId),
      fetchOrdersByCar(carId),
    ]);

    return { carData, ordersData };
  } catch (error) {
    console.error("Error fetching car and orders:", error);
    throw error; // Optionally, rethrow the error to handle it in your component
  }
};
// export const updatePrice = async (restId, menuNumber, newPrice) => {
//   try {
//     const response = await fetch(`/api/auth/priceUpd`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ restId, menuNumber, newPrice }),
//     });

//     if (!response.ok) {
//       throw new Error("Failed to update price");
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Error updating price:", error);
//     throw error;
//   }
// };

// export const toggleIsActive = async (restId, menuNumber) => {
//   try {
//     const apiUrl = `/api/auth/toggleActive`;
//     const response = await fetch(apiUrl, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ restId, menuNumber }),
//     });

//     if (!response.ok) {
//       throw new Error(
//         `Failed to toggle isActive status of the menu item with number ${menuNumber}`
//       );
//     }

//     const updatedMenu = await response.json();
//     return updatedMenu;
//   } catch (error) {
//     console.error(
//       `Error toggling isActive status with rest ID ${restId} and menu number ${menuNumber}:`,
//       error
//     );
//     throw error;
//   }
// };

// export const updateName = async (restId, menuNumber, newName, lang = "en") => {
//   try {
//     const apiUrl = `/api/auth/changeName`;
//     const response = await fetch(apiUrl, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ restId, menuNumber, newName, lang }),
//     });
//     console.log("response", response);

//     if (!response.ok) {
//       throw new Error(
//         `Failed to update name of the menu item with number ${menuNumber} in ${lang}`
//       );
//     }

//     const updatedMenu = await response.json();
//     return updatedMenu;
//   } catch (error) {
//     console.error(
//       `Error updating name in English with rest ID ${restId} and menu number ${menuNumber}:`,
//       error
//     );
//     throw error;
//   }
// };
