import { Order } from "@models/order";
import { Car } from "@models/car";
import { connectToDB } from "@utils/database";

export const PATCH = async (request, { params }) => {
  try {
    await connectToDB();

    const { orderId } = params;
    console.log("ordeID IS", orderId);

    // Find the order by its ID
    const order = await Order.findById(orderId);

    if (!order) {
      return new Response(
        JSON.stringify({ success: false, message: "Order not found" }),
        { status: 404 }
      );
    }

    // Toggle the confirmed status
    order.confirmed = !order.confirmed;

    console.log("Updated Order before saving:", order);
    // Save the updated order
    const updatedOrder = await order.save();

    return new Response(
      JSON.stringify({
        data: updatedOrder,
        message: ` Статус успешно обновлен на ${order.confirmed} `,
      }),
      {
        success: true,
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating order:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to toggle order confirmation",
        data: error.message,
        success: false,
      }),
      { status: 500 }
    );
  }
};
