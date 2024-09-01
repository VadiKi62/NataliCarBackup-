import { Car } from "@models/car";
import { connectToDB } from "@utils/database";


export const GET = async () => {
  try {
    await connectToDB(); // Ensure you're connected to the database
    const cars = await Car.find(); // Fetch all cars
    return new Response(JSON.stringify(cars), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response("Failed to fetch cars", { status: 500 });
  }
};

