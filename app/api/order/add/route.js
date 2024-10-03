import { connectToDB } from "@utils/database";
import { Car } from "@models/car";
import { Order } from "@models/order";

// export async function POST(request) {
//   try {
//     await connectToDB();

//     const {
//       carNumber,
//       customerName,
//       phone,
//       email,
//       rentalStartDate,
//       rentalEndDate,
//     } = await request.json();

//     // Find the car by its car number
//     const existingCar = await Car.findOne({ carNumber: carNumber });

//     console.log("EXISTING CAR  FROM API", existingCar);
//     if (!existingCar) {
//       return new Response(`Car with number ${carNumber} does not exist`, {
//         status: 404,
//       });
//     }

//     // Calculate the number of rental days
//     const startDate = new Date(rentalStartDate);
//     const endDate = new Date(rentalEndDate);
//     const rentalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

//     // Calculate the price per day using the car's pricing tiers
//     const pricePerDay = existingCar.calculatePrice(rentalDays);
//     const totalPrice = pricePerDay * rentalDays;

//     // Create a new order document with calculated values
//     const newOrder = new Order({
//       customerName,
//       phone,
//       email,
//       rentalStartDate: startDate,
//       rentalEndDate: endDate,
//       car: existingCar._id,
//       carModel: existingCar.model, // Adding car title
//       carNumber: existingCar.carNumber, // Adding car number
//       numberOfDays: rentalDays, // Adding calculated number of days
//       totalPrice, // Adding calculated total price
//     });

//     // Save the new order
//     await newOrder.save();

//     // Add the new order to the car's orders array
//     existingCar.orders.push(newOrder._id);

//     // Save the updated car document
//     await existingCar.save();

//     return new Response(JSON.stringify(newOrder), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error adding new order:", error);
//     return new Response(`Failed to add new order: ${error.message}`, {
//       status: 500,
//     });
//   }
// }

// const orderData = {
//   carNumber: "LIM1",
//   customerName: "N",
//   phone: "1231231",
//   email: "sadas@gmail.com",
//   rentalEndDate: "2024-09-29T21:09:55.386Z",
//   rentalStartDate: "2024-09-27T21:28:34.006+00:00",
// };
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
    } = await request.json();

    // Find the car by its car number
    const existingCar = await Car.findOne({ carNumber: carNumber });

    console.log("EXISTING CAR FROM API", existingCar.carNumber);
    if (!existingCar) {
      return new Response(`Car with number ${carNumber} does not exist`, {
        status: 404,
      });
    }

    // Calculate the number of rental days
    const startDate = new Date(rentalStartDate);
    const endDate = new Date(rentalEndDate);
    const rentalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Check for existing orders
    const existingOrders = await Order.find({
      car: existingCar._id,
      $or: [
        {
          rentalStartDate: { $lte: endDate },
          rentalEndDate: { $gte: startDate },
        },
        { rentalStartDate: { $gte: startDate, $lte: endDate } },
        { rentalEndDate: { $gte: startDate, $lte: endDate } },
      ],
    });

    const confirmedDates = [];
    const nonConfirmedDates = [];

    for (const order of existingOrders) {
      const orderStartDate = new Date(order.rentalStartDate);
      const orderEndDate = new Date(order.rentalEndDate);

      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        if (d >= orderStartDate && d <= orderEndDate) {
          if (order.confirmed) {
            confirmedDates.push(d.toISOString().split("T")[0]);
          } else {
            nonConfirmedDates.push(d.toISOString().split("T")[0]);
          }
        }
      }
    }

    if (confirmedDates.length > 0) {
      return new Response(
        JSON.stringify({
          message: `Даты ${confirmedDates.join(
            ", "
          )} уже забронированы и не доступны. Пожалуйста, посмотрите другие даты или другую машину.`,
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
      rentalStartDate: startDate,
      rentalEndDate: endDate,
      car: existingCar._id,
      carModel: existingCar.model,
      numberOfDays: rentalDays,
      totalPrice,
      date: new Date(),
    });

    if (nonConfirmedDates.length > 0) {
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
    console.log("New Order:", newOrder);

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
