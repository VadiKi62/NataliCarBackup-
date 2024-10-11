import { Order } from "@models/order";
import { Car } from "@models/car";
import { connectToDB } from "@utils/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

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

    // Get the updated start and end dates
    let newStartDate = rentalStartDate
      ? new Date(rentalStartDate)
      : order.rentalStartDate;
    let newEndDate = rentalEndDate
      ? new Date(rentalEndDate)
      : order.rentalEndDate;

    newStartDate = dayjs(rentalStartDate).utc();
    newEndDate = dayjs(rentalEndDate).utc();

    const newTimeIn = timeIn ? dayjs(timeIn).utc() : order.timeIn;
    const newTimeOut = timeOut ? dayjs(timeOut).utc() : order.timeOut;
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
          confirmed: conflictingOrder.confirmed,
        });
      } else {
        nonConfirmedOrders.push({
          id: conflictingOrder._id,
          rentalStartDate: conflictingOrder.rentalStartDate,
          rentalEndDate: conflictingOrder.rentalEndDate,
          phone: conflictingOrder.phone,
          email: conflictingOrder.email,
          customerName: conflictingOrder.customerName,
          confirmed: conflictingOrder.confirmed,
        });
      }
    }

    // Response 300: Conflicting confirmed orders exist, no update
    if (confirmedOrders.length > 0) {
      return new Response(
        JSON.stringify({
          message: `Заказ не обновлен, даты уже заняты и подтверждены:`,
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

    // Update the order with the new dates, rental days, total price, and new time/place info
    order.rentalStartDate = newStartDate.toDate();
    order.rentalEndDate = newEndDate.toDate();
    order.numberOfDays = rentalDays;
    order.totalPrice = totalPrice;
    order.timeIn = newTimeIn;
    order.timeOut = newTimeOut;
    order.placeIn = placeIn || order.placeIn;
    order.placeOut = placeOut || order.placeOut;

    // Response 201: Only non-confirmed conflicts, update and return conflict info
    if (nonConfirmedOrders.length > 0) {
      order.hasConflictDates = nonConfirmedOrders.map((order) => order.id);
      const message =
        "Конфликт бронирования, заказ создан но возникли брони в одни дни ";
      const data = {
        nonConfirmedOrders: nonConfirmedOrders,
        updatedOrder: order,
      };
      await order.save();

      return new Response(
        JSON.stringify({
          message,
          data,
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Response 200: No conflicts, update the order
    await order.save(); // Save the updated order

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
