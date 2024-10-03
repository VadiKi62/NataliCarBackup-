import { Order } from "@models/order";
import { connectToDB } from "@utils/database";

export const PUT = async (req) => {
  try {
    await connectToDB();

    const { _id, ...updateFields } = await req.json();

    const updatedOrder = await Order.findByIdAndUpdate(_id, updateFields, {
      new: true,
    });

    if (!updatedOrder) {
      return new Response({
        success: false,
        message: "Car not found",
      });
    }
    return new Response(JSON.stringify(updatedOrder), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Failed to update car", { status: 500, data: error });
  }
};
