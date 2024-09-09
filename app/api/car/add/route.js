import { Car } from "@models/car";
import { connectToDB } from "@utils/database";
import { carsData } from "@utils/initialData";

// export const POST = async (request) => {
//   try {
//     await connectToDB();

//     for (const carData of carsData) {
//       console.log(carData);
//       const { carNumber } = carData;
//       console.log(carNumber);

//       const existingCar = await Car.findOne({ carNumber });
//       console.log(existingCar);

//       if (existingCar) {
//         return new Response(`Car with number ${carNumber} already exists`, {
//           status: 409,
//         });
//       }
//     }

//     // Add cars to the database
//     const newCars = await Car.insertMany(carsData);
//     return new Response(JSON.stringify(newCars), { status: 201 });
//   } catch (error) {
//     return new Response("Failed to add new cars", { status: 500 });
//   }
// };

export const POST = async (request) => {
  try {
    await connectToDB();

    // const carsData = await request.json(); // Assuming the cars data is sent in the request body

    for (const carData of carsData) {
      const { carNumber } = carData;

      const existingCar = await Car.findOne({ carNumber });

      if (existingCar) {
        return new Response(`Car with number ${carNumber} already exists`, {
          status: 409,
        });
      }
    }

    // Add cars to the database
    const newCars = await Car.create(carsData);
    return new Response(JSON.stringify(newCars), { status: 201 });
  } catch (error) {
    console.error("Error adding new cars:", error);
    return new Response(`Failed to add new cars: ${error.message}`, {
      status: 500,
    });
  }
};
