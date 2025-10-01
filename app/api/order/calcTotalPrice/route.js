import { connectToDB } from "@utils/database";
import { Car } from "@models/car";
import dayjs from "dayjs";

export async function POST(request) {
  try {
    await connectToDB();
    const { carNumber, rentalStartDate, rentalEndDate } = await request.json();
    if (!carNumber || !rentalStartDate || !rentalEndDate) {
      return new Response(
        JSON.stringify({ message: "Missing parameters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const car = await Car.findOne({ carNumber });
    if (!car) {
      return new Response(
        JSON.stringify({ message: "Car not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const totalPrice = await car.calculateTotalRentalPricePerDay(
      dayjs(rentalStartDate),
      dayjs(rentalEndDate)
    );
    const days = dayjs(rentalEndDate).diff(dayjs(rentalStartDate), "day") + 1;
    return new Response(
      JSON.stringify({ totalPrice, days }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
