import { Order } from "@models/order";
import { Car } from "@models/car";
import { connectToDB } from "@utils/database";

export const DELETE = async (request, { params }) => {
  try {
    await connectToDB();
    const { orderId } = params;

    console.log("orderId", orderId);

    // Find the order to be deleted
    const orderToDelete = await Order.findById(orderId);

    if (!orderToDelete) {
      return new Response(JSON.stringify({ message: "Order not found" }), {
        status: 404,
      });
    }
    const carOfTheOrder = await Car.findById(orderToDelete.car);
    if (!carOfTheOrder) {
      return new Response(JSON.stringify({ message: "Car not found" }), {
        status: 404,
      });
    }

    // Remove the order ID from the car's orders array
    const newOrderArray = carOfTheOrder.orders.filter(
      (order) => order._id !== orderId
    );

    // Update the car with the new orders array
    await Car.findByIdAndUpdate(orderToDelete.car, { orders: newOrderArray });

    // Check for conflicts and update conflicting orders
    if (
      orderToDelete.hasConflictDates &&
      Array.isArray(orderToDelete.hasConflictDates)
    ) {
      await Order.updateMany(
        { _id: { $in: orderToDelete.hasConflictDates } },
        { $pull: { hasConflictDates: orderId } } // Remove orderId from hasConflictDates
      );
    }

    // Delete the order
    await Order.findByIdAndDelete(orderId);

    return new Response(
      JSON.stringify({
        message: `Order with id ${orderId} deleted successfully`,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting order:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
