import { Car } from "@models/car";
import { connectToDB } from "@utils/database";

export const PUT = async (req) => {
  //   console.log(req);
  //   const { id } = req.query;
  try {
    await connectToDB();
    console.log(req);
    const { _id, ...updateFields } = req.body.json();
    console.log(_id);

    const updatedCar = await Car.findByIdAndUpdate(_id, updateFields, {
      new: true, // Return the updated document
    });

    if (!updatedCar) {
      return new Response({
        success: false,
        message: "Car not found",
      });
    }
    return new Response(JSON.stringify(updatedCar), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Failed to update car", { status: 500, data: error });
  }
};
