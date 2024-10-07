import { Order } from "@models/order";
import { connectToDB } from "@utils/database";

export const PATCH = async (req) => {
  try {
    await connectToDB();

    // Get the order ID from the request body
    const { _id } = await req.json();

    // Find the order by its ID
    const order = await Order.findById(_id);

    if (!order) {
      return new Response(
        JSON.stringify({ success: false, message: "Order not found" }),
        { status: 404 }
      );
    }

    // Toggle the confirmed status
    order.confirmed = !order.confirmed;

    // Save the updated order
    const updatedOrder = await order.save();

    return new Response(JSON.stringify(updatedOrder), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Failed to toggle order confirmation", { status: 500 });
  }
};
