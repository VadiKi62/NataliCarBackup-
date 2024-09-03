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
    orders: [
      {
        customerName: "John Doe",
        rentalStartDate: new Date("2024-09-10"),
        rentalEndDate: new Date("2024-09-15"),
        totalPrice: 1000 // 5 days * 200 per day
      },
      {
        customerName: "Jane Smith",
        rentalStartDate: new Date("2024-10-01"),
        rentalEndDate: new Date("2024-10-03"),
        totalPrice: 400 // 2 days * 200 per day
      }
    ]
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
    orders: [
      {
        customerName: "Bob Johnson",
        rentalStartDate: new Date("2024-09-20"),
        rentalEndDate: new Date("2024-09-25"),
        totalPrice: 250 // 5 days * 50 per day
      },
      {
        customerName: "Alice Brown",
        rentalStartDate: new Date("2024-10-05"),
        rentalEndDate: new Date("2024-10-07"),
        totalPrice: 100 // 2 days * 50 per day
      }
    ]
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
    orders: [
      {
        customerName: "Charlie Wilson",
        rentalStartDate: new Date("2024-09-15"),
        rentalEndDate: new Date("2024-09-18"),
        totalPrice: 360 // 3 days * 120 per day
      },
      {
        customerName: "Diana Lee",
        rentalStartDate: new Date("2024-10-10"),
        rentalEndDate: new Date("2024-10-14"),
        totalPrice: 480 // 4 days * 120 per day
      }
    ]
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
