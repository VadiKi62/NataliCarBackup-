export const API_URL =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_LOCAL_API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL;

export const fetchCar = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/car/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Car not found');
      } else {
        throw new Error('Failed to fetch car');
      }
    }

    const car = await response.json();
    console.log('Fetched Car:', car);
    return car;
  } catch (error) {
    console.error('Error fetching car:', error.message);
    throw error; // Re-throwing the error so the caller can handle it
  }
}


export const fetchAll = async (restId) => {
  try {
    const apiUrl = `${API_URL}/api/car/all`;
    const data = await fetch(apiUrl, {
      next: { revalidate: 1 },
    });
    if (!data.ok) {
      throw new Error(`Failed to fetch cars`);
    }
    const carsData = await data.json();
    return carsData;
  } catch (error) {
    console.error(`Error fetching menu with rest ID  ${restId}:`, error);
    throw error;
  }
};

export const updatePrice = async (restId, menuNumber, newPrice) => {
  try {
    const response = await fetch(`/api/auth/priceUpd`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ restId, menuNumber, newPrice }),
    });

    if (!response.ok) {
      throw new Error("Failed to update price");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating price:", error);
    throw error;
  }
};

export const toggleIsActive = async (restId, menuNumber) => {
  try {
    const apiUrl = `/api/auth/toggleActive`;
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

export const updateName = async (restId, menuNumber, newName, lang = "en") => {
  try {
    const apiUrl = `/api/auth/changeName`;
    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ restId, menuNumber, newName, lang }),
    });
    console.log("response", response);

    if (!response.ok) {
      throw new Error(
        `Failed to update name of the menu item with number ${menuNumber} in ${lang}`
      );
    }

    const updatedMenu = await response.json();
    return updatedMenu;
  } catch (error) {
    console.error(
      `Error updating name in English with rest ID ${restId} and menu number ${menuNumber}:`,
      error
    );
    throw error;
  }
};
