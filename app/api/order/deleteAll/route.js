import { Order } from "@models/order";
import { connectToDB } from "@utils/database";

export const DELETE = async (request) => {
  try {
    await connectToDB();

    // Delete all existing cars
    await Order.deleteMany({});
    return new Response("ALl orders deleted", {
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting orders:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
