import { Car } from "@models/car";
import { connectToDB } from "@utils/database";
// import {carsData} from "@utils/initialData"

const carsData = [
  {
    carNumber: 'PREM123',
    model: 'Mercedes-Benz S-Class',
    photoUrl: '/images/mercedes-s-class.jpg',
    class: 'Premium',
    transmission: 'Automatic',
    numberOfDoors: 4,
    airConditioning: true,
    enginePower: 450,
    pricePerDay: 200,
    orders: [] // Initially empty
  },
  {
    carNumber: 'ECO456',
    model: 'Toyota Corolla',
    photoUrl: '/images/toyota-corolla.jpg',
    class: 'Economy',
    transmission: 'Manual',
    numberOfDoors: 4,
    airConditioning: true,
    enginePower: 130,
    pricePerDay: 50,
    orders: [] // Initially empty
  },
  {
    carNumber: 'MIN789',
    model: 'Ford Transit',
    photoUrl: '/images/ford-transit.jpg',
    class: 'MiniBus',
    transmission: 'Automatic',
    numberOfDoors: 5,
    airConditioning: true,
    enginePower: 200,
    pricePerDay: 120,
    orders: [] // Initially empty
  }
];


export const POST = async (request) => {
    console.log("HELOO222")
  try {
    await connectToDB();
    console.log("HELOOCARSDATA",carsData)
    console.log("HELOO")
    for ( const carData of carsData )
    {
  console.log(carData)
  const { carNumber } = carData;
  console.log(carNumber)
  // Ensure that this is an asynchronous call if it interacts with the database
      const existingCar = await Car.findOne( { carNumber } );
        console.log(existingCar)

  if (existingCar) {
    return new Response(`Car with number ${carNumber} already exists`, {
      status: 409,
    });
  }
}

    // Add cars to the database
    const newCars = await Car.insertMany(carsData);
    return new Response(JSON.stringify(newCars), { status: 201 });
  } catch (error) {
    return new Response("Failed to add new cars", { status: 500 });
  }
};
