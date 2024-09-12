import axios from "axios";
export const API_URL =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_LOCAL_API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL;

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

export const fetchAll = async () => {
  try {
    const apiUrl = `${API_URL}/api/car/all`;
    const data = await fetch(apiUrl, {
      next: { revalidate: 1 },
    });
    if (!data.ok) {
      throw new Error("Failed to fetch cars");
    }
    const carsData = await data.json();
    return carsData;
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw error;
  }
};

export const addOrder = async (orderData) => {
  try {
    console.log(orderData);

    const response = await axios.post(`${API_URL}/api/order/add`, orderData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Response:", response);

    const result = response.data;
    console.log("Order added:", result);

    return result;
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 200
      console.error(
        `Server error: ${error.response.status} - ${error.response.data}`
      );
      throw new Error(
        `Server error: ${error.response.status} - ${error.response.data}`
      );
    } else {
      // Network or other errors
      console.error("Error adding order:", error.message);
      throw error;
    }
  }
};

export const fetchOrdersByCar = async (carId) => {
  try {
    const response = await fetch(`/api/order/${carId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    const orders = await response.json();
    return orders; // Return the orders data
  } catch (error) {
    console.error("Error fetching orders:", error);
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
