import { connectToDB } from "@utils/database";
import mongoose from "mongoose";
import { Car } from "@models/car";
import { Order } from "@models/order";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";
import {
  analyzeDates,
  isSameDay,
  isSameOrBefore,
  calculateAvailableTimes,
  setTimeToDatejs,
} from "@utils/analyzeDates";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.tz.setDefault("Europe/Athens");

export async function POST(request) {
  try {
    await connectToDB();

    const {
      carNumber,
      customerName,
      phone,
      email,
      rentalStartDate,
      rentalEndDate,
      timeIn,
      timeOut,
      placeIn,
      placeOut,
    } = await request.json();
    console.log("TIME", timeIn);

    // TODO проверить чтобы не было дат в один день

    // TODO проверить конфликты которые возникают именно между последним днем одного бронирования и первым днем другого - дать таким конфликтам другой статус

    // Find the car by its car number
    const existingCar = await Car.findOne({ carNumber: carNumber });

    if (!existingCar) {
      return new Response(`Car with number ${carNumber} does not exist`, {
        status: 404,
      });
    }

    // Calculate the number of rental days using dayjs
    const startDate = dayjs(rentalStartDate);
    const endDate = dayjs(rentalEndDate);
    const rentalDays = endDate.diff(startDate, "day"); // include only start  day

    // Check for existing orders
    const existingOrders = await Order.find({
      car: existingCar._id,
      $or: [
        {
          rentalStartDate: { $lte: endDate.toDate() },
          rentalEndDate: { $gte: startDate.toDate() },
        },
        {
          rentalStartDate: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        },
        { rentalEndDate: { $gte: startDate.toDate(), $lte: endDate.toDate() } },
      ],
    });

    const result = analyzeDates(existingOrders);
    console.log(result);
    const resultConfirmedInnerDates = result.confirmed.filter(
      (item) =>
        !item.isStart &&
        !item.isEnd &&
        item.datejs.isBetween(startDate, endDate, "day", "()")
    );
    console.log("resultConfirmedInnerDates", resultConfirmedInnerDates);

    const isStartConfirmedeStartBooking = result.confirmed.find((item) => {
      return item.isStart && item.dateFormat === startDate.format("YYYY-MM-DD");
    });
    const isEndConfirmedeEndBooking = result.confirmed.find((item) => {
      return item.isEnd && item.dateFormat === endDate.format("YYYY-MM-DD");
    });
    console.log("isStartConfirmedeStartBooking", isStartConfirmedeStartBooking);
    console.log("isEndConfirmedeEndBooking", isEndConfirmedeEndBooking);

    const confirmedDates = [];
    const nonConfirmedDates = [];
    const conflicOrdersId = [];

    for (const order of existingOrders) {
      const orderStartDate = dayjs(order.rentalStartDate);
      const orderEndDate = dayjs(order.rentalEndDate);

      for (
        let d = startDate;
        d.isBefore(endDate) || d.isSame(endDate);
        d = d.add(1, "day")
      ) {
        if (d.isBetween(orderStartDate, orderEndDate, "day", "()")) {
          if (order.confirmed) {
            confirmedDates.push(d.format("MMM D"));
          } else {
            conflicOrdersId.push(new mongoose.Types.ObjectId(order._id));
            nonConfirmedDates.push(d.format("MMM D"));
          }
        }
      }
    }

    console.log("confirmedDates", confirmedDates);
    let conflictMessage = "";
    let conflictDates;

    if (
      // confirmedDates.length > 0 ||
      isStartConfirmedeStartBooking ||
      isEndConfirmedeEndBooking ||
      resultConfirmedInnerDates.length > 0
    ) {
      conflictDates = new Set([
        // ...confirmedDates,
        ...resultConfirmedInnerDates?.datejs?.format("MMM D"),
        isStartConfirmedeStartBooking?.datejs?.format("MMM D"),
        isEndConfirmedeEndBooking?.datejs?.format("MMM D"),
      ]);
      conflictMessage =
        conflictMessage +
        `Даты ${[...conflictDates].join(
          ", "
        )} уже забронированы и не доступны.`;
      // }

      // if (confirmedDates.length > 0) {
      return new Response(
        JSON.stringify({
          message: conflictMessage,
          conflictDates: conflictDates,
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Calculate the price per day using the car's pricing tiers
    const pricePerDay = existingCar.calculatePrice(rentalDays);
    const totalPrice = pricePerDay * rentalDays;

    // Create a new order document with calculated values
    const newOrder = new Order({
      carNumber: carNumber,
      customerName,
      phone,
      email,
      rentalStartDate: startDate.toDate(),
      rentalEndDate: endDate.toDate(),
      car: existingCar._id,
      carModel: existingCar.model,
      numberOfDays: rentalDays,
      totalPrice,
      timeIn: timeIn ? timeIn : setTimeToDatejs(startDate, null, true),
      timeOut: timeOut ? timeOut : setTimeToDatejs(endDate, null),
      placeIn,
      placeOut,
      date: dayjs().format("MMM D HH:mm"),
    });

    if (nonConfirmedDates.length > 0) {
      newOrder.hasConflictDates = [
        ...new Set([...newOrder.hasConflictDates, ...conflicOrdersId]),
      ];

      await newOrder.save();

      await updateConflictingOrders(conflicOrdersId, newOrder._id);

      return new Response(
        JSON.stringify({
          message: `Даты ${nonConfirmedDates.join(
            ", "
          )} забронированы но пока не подтверждены другими пользователями. Мы свяжемся с Вами в течении 24 часов и уточним наличие дат.`,
          data: newOrder,
        }),
        {
          status: 402,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Save the new order
    await newOrder.save();
    // Add the new order to the car's orders array
    existingCar.orders.push(newOrder._id);
    // Save the updated car document
    await existingCar.save();

    return new Response(JSON.stringify(newOrder), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error adding new order:", error);
    return new Response(`Failed to add new order: ${error.message}`, {
      status: 500,
    });
  }
}

// function that iterates over all conflicting orders adding to them new conflicts orders
async function updateConflictingOrders(conflicOrdersId, newOrderId) {
  try {
    // Iterate over each conflicting order ID
    for (const conflictOrderId of conflicOrdersId) {
      // Find the order by its ID
      const order = await Order.findById(conflictOrderId);

      if (order) {
        // Add the new order ID to the conflicting order's hasConflictDates array
        if (!order.hasConflictDates.includes(newOrderId)) {
          order.hasConflictDates.push(newOrderId);
          await order.save(); // Save the updated order
        }
      }
    }

    console.log("Conflicting orders updated successfully");
  } catch (error) {
    console.error("Error updating conflicting orders:", error);
  }
}
