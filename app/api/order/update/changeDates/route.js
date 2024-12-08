import { Order } from "@models/order";
import { Car } from "@models/car";
import { connectToDB } from "@utils/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  analyzeDates,
  isSameDay,
  isSameOrBefore,
  calculateAvailableTimes,
  setTimeToDatejs,
  checkConflicts,
} from "@utils/analyzeDates";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Europe/Athens");

export const PUT = async (req) => {
  try {
    await connectToDB();

    const {
      _id,
      rentalStartDate,
      rentalEndDate,
      timeIn,
      timeOut,
      placeIn,
      placeOut,
    } = await req.json();

    // Find the order to update
    const order = await Order.findById(_id).populate("car");
    console.log("order", order);

    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found" }), {
        status: 404,
      });
    }

    // Find the car associated with the order
    const car = order.car;

    // Convert input dates and times
    const newStartDate = rentalStartDate
      ? dayjs(rentalStartDate).utc()
      : dayjs(order.rentalStartDate);
    const newEndDate = rentalEndDate
      ? dayjs(rentalEndDate).utc()
      : dayjs(order.rentalEndDate);
    const newTimeIn = timeIn ? dayjs(timeIn).utc() : dayjs(order.timeIn);
    const newTimeOut = timeOut ? dayjs(timeOut).utc() : dayjs(order.timeOut);

    // Ensure start and end dates are not the same
    if (newStartDate.isSame(newEndDate, "day")) {
      return new Response(
        JSON.stringify({
          message: "Start and end dates cannot be the same.",
        }),
        { status: 405 }
      );
    }

    // Check if current order already has conflicting dates
    const { resolvedConflicts, stillConflictingOrders } =
      await checkForResolvedConflicts(order, newStartDate, newEndDate);

    // Remove resolved conflicts from order
    if (resolvedConflicts.length > 0) {
      order.hasConflictDates = order.hasConflictDates.filter(
        (id) => !resolvedConflicts.includes(id.toString())
      );
    }

    // Fetch all orders for the car, excluding the current order
    const allOrders = await Order.find({
      car: car._id,
      _id: { $ne: _id },
    });

    // Transform orders into the required format for `checkConflicts`
    const existingOrders = allOrders.map((existingOrder) => ({
      isStart: true,
      isEnd: true,
      dateFormat: dayjs(existingOrder.rentalStartDate).format("YYYY-MM-DD"),
      timeStart: existingOrder.timeIn,
      timeEnd: existingOrder.timeOut,
      datejs: dayjs(existingOrder.rentalStartDate),
      orderId: existingOrder._id.toString(),
    }));

    // Check for conflicts using `checkConflicts`
    const conflictCheck = checkConflicts(
      existingOrders,
      newStartDate,
      newEndDate,
      newTimeIn,
      newTimeOut
    );

    if (conflictCheck) {
      // Handle conflicts
      const { status, data } = conflictCheck;
      return new Response(
        JSON.stringify({
          message: data.conflictMessage,
          conflictDates: data.conflictDates || [],
        }),
        { status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Recalculate the rental details
    const rentalDays = Math.ceil(
      (newEndDate - newStartDate) / (1000 * 60 * 60 * 24)
    );
    const pricePerDay = car.calculatePrice(rentalDays);
    const totalPrice = pricePerDay * rentalDays;

    // Update the order
    order.rentalStartDate = newStartDate.toDate();
    order.rentalEndDate = newEndDate.toDate();
    order.numberOfDays = rentalDays;
    order.totalPrice = totalPrice;
    order.timeIn = newTimeIn;
    order.timeOut = newTimeOut;
    order.placeIn = placeIn || order.placeIn;
    order.placeOut = placeOut || order.placeOut;

    await order.save();

    return new Response(
      JSON.stringify({
        message: `ВСЕ ОТЛИЧНО! Даты изменены.`,
        data: order,
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

// Function to check if existing conflicts are resolved after changing dates
async function checkForResolvedConflicts(order, newStartDate, newEndDate) {
  const existingConflicts = order.hasConflictDates || [];

  const resolvedConflicts = [];
  const stillConflictingOrders = [];

  // Check each existing conflict
  for (const conflictId of existingConflicts) {
    const conflictingOrder = await Order.findById(conflictId);

    if (conflictingOrder) {
      // Compare conflicting order dates with new start/end dates
      const conflictStartDate = dayjs(conflictingOrder.rentalStartDate);
      const conflictEndDate = dayjs(conflictingOrder.rentalEndDate);

      // If the conflicting order no longer overlaps with the new dates
      if (
        newEndDate.isBefore(conflictStartDate) ||
        newStartDate.isAfter(conflictEndDate)
      ) {
        resolvedConflicts.push(conflictingOrder._id); // This conflict is resolved
      } else {
        stillConflictingOrders.push(conflictingOrder._id); // Still conflicting
      }
    }
  }

  return { resolvedConflicts, stillConflictingOrders };
}
