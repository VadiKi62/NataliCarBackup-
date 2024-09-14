import { Order } from "@models/order";
import { connectToDB } from "@utils/database";

export const GET = async () => {
  console.log("fffffffiii");
  try {
    await connectToDB();
    console.log("first");
    const orders = await Order.find();
    console.log("second");
    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Failed to fetch cars", { status: 500, data: error });
  }
};
