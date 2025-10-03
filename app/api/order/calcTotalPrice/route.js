import { connectToDB } from "@utils/database";
import { Car } from "@models/car";
import dayjs from "dayjs";

export async function POST(request) {
  // Логируем параметры для диагностики
  let debugBody;
  try {
    await connectToDB();
    debugBody = await request.json();
    const {
      carNumber,
      rentalStartDate,
      rentalEndDate,
      kacko = "TPL",
      childSeats = 0,
    } = debugBody;
    console.log("[API calcTotalPrice] Получены параметры:", {
      carNumber,
      rentalStartDate,
      rentalEndDate,
      kacko,
      childSeats,
    });
    if (!carNumber || !rentalStartDate || !rentalEndDate) {
      return new Response(JSON.stringify({ message: "Missing parameters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const car = await Car.findOne({ carNumber });
    if (!car) {
      return new Response(JSON.stringify({ message: "Car not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.log("API calcTotalPrice params:", { kacko, childSeats });
    const { total, days } = await car.calculateTotalRentalPricePerDay(
      dayjs(rentalStartDate),
      dayjs(rentalEndDate),
      kacko,
      childSeats
    );
    return new Response(JSON.stringify({ totalPrice: total, days }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
