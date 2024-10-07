import { Order } from "@models/order";
import { connectToDB } from "@utils/database";

export const PUT = async (req) => {
  try {
    await connectToDB();

    const { _id, rentalStartDate, rentalEndDate } = await req.json();

    // Find the order to update
    const order = await Order.findById(_id).populate("car");

    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found" }), {
        status: 404,
      });
    }

    // Find the car associated with the order
    const car = order.car;

    // Get the updated start and end dates
    const newStartDate = rentalStartDate
      ? new Date(rentalStartDate)
      : order.rentalStartDate;
    const newEndDate = rentalEndDate
      ? new Date(rentalEndDate)
      : order.rentalEndDate;

    // Check for conflicting orders
    const conflictingOrders = await Order.find({
      car: car._id,
      _id: { $ne: _id }, // Exclude the current order
      $or: [
        {
          rentalStartDate: { $lte: newEndDate },
          rentalEndDate: { $gte: newStartDate },
        },
        { rentalStartDate: { $gte: newStartDate, $lte: newEndDate } },
        { rentalEndDate: { $gte: newStartDate, $lte: newEndDate } },
      ],
    });

    // Separate confirmed and non-confirmed orders
    const confirmedOrders = [];
    const nonConfirmedOrders = [];

    for (const conflictingOrder of conflictingOrders) {
      if (conflictingOrder.confirmed) {
        confirmedOrders.push({
          id: conflictingOrder._id,
          customerName: conflictingOrder.customerName,
          phone: conflictingOrder.phone,
          email: conflictingOrder.email,
          rentalStartDate: conflictingOrder.rentalStartDate,
          rentalEndDate: conflictingOrder.rentalEndDate,
        });
      } else {
        nonConfirmedOrders.push({
          id: conflictingOrder._id,
          rentalStartDate: conflictingOrder.rentalStartDate,
          rentalEndDate: conflictingOrder.rentalEndDate,
        });
      }
    }

    // Response 300: Conflicting confirmed orders exist, no update
    if (confirmedOrders.length > 0) {
      return new Response(
        JSON.stringify({
          message: `The following dates are already confirmed and unavailable:`,
          confirmedOrders: confirmedOrders,
        }),
        { status: 300, headers: { "Content-Type": "application/json" } }
      );
    }

    // If there are no confirmed conflicts, we proceed with recalculation
    const rentalDays = Math.ceil(
      (newEndDate - newStartDate) / (1000 * 60 * 60 * 24)
    );
    const pricePerDay = car.calculatePrice(rentalDays);
    const totalPrice = pricePerDay * rentalDays;

    // Update the order with the new dates, rental days, and total price
    order.rentalStartDate = newStartDate;
    order.rentalEndDate = newEndDate;
    order.numberOfDays = rentalDays;
    order.totalPrice = totalPrice;

    // Response 201: Only non-confirmed conflicts, update and return conflict info
    if (nonConfirmedOrders.length > 0) {
      await order.save(); // Save the updated order

      return new Response(
        JSON.stringify({
          message: `The order has been updated, but some dates are pending confirmation:`,
          nonConfirmedOrders: nonConfirmedOrders,
          updatedOrder: order,
        }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      );
    }

    // Response 200: No conflicts, update the order
    await order.save(); // Save the updated order

    return new Response(
      JSON.stringify({
        message: `Order updated successfully with no conflicts.`,
        updatedOrder: order,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating order:", error);
    return new Response(`Failed to update order: ${error.message}`, {
      status: 500,
    });
  }
};
