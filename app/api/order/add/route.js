import { Car } from "@models/car";
import { Order } from "@models/order";
import { connectToDB } from "@utils/database";

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

    console.log("CARNUMBER FROM API", carNumber);

    // Find the car by its car number
    const existingCar = await Car.findOne({ carNumber: carNumber });

    console.log("EXISTING CAR  FROM API", existingCar);
    if (!existingCar) {
      return new Response(`Car with number ${carNumber} does not exist`, {
        status: 404,
      });
    }

    // Calculate the number of rental days
    const startDate = new Date(rentalStartDate);
    const endDate = new Date(rentalEndDate);
    const rentalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Calculate the price per day using the car's pricing tiers
    const pricePerDay = existingCar.calculatePrice(rentalDays);
    const totalPrice = pricePerDay * rentalDays;

    // Create a new order document with calculated values
    const newOrder = new Order({
      customerName,
      phone,
      email,
      rentalStartDate: startDate,
      rentalEndDate: endDate,
      car: existingCar._id,
      carModel: existingCar.model, // Adding car title
      carNumber: existingCar.carNumber, // Adding car number
      numberOfDays: rentalDays, // Adding calculated number of days
      totalPrice, // Adding calculated total price
    });

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

export async function GET(req, res) {
  return new Response(JSON.stringify({ message: "API is working" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
