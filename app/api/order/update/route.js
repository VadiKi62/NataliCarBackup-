import { Order } from "@models/order";
import { connectToDB } from "@utils/database";

export const PUT = async (req) => {
  try {
    await connectToDB();

  const { _id, phone, email, customerName, my_order, flightNumber } = await req.json(); // Destructure only the allowed fields

    // Filter the update to only include allowed fields
    const updateFields = {};
    if (phone) updateFields.phone = phone;
    if (email) updateFields.email = email;
    if (customerName) updateFields.customerName = customerName;
    if (typeof my_order === 'boolean') updateFields.my_order = my_order;
  // Allow updating flightNumber (accept empty string as a valid value)
  if (flightNumber !== undefined) updateFields.flightNumber = flightNumber;

    // Update the order with only the allowed fields
    const updatedOrder = await Order.findByIdAndUpdate(_id, updateFields, {
      new: true, // return the updated document
    });

    if (!updatedOrder) {
      return new Response(
        JSON.stringify({ success: false, message: "Order not found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(updatedOrder), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Failed to update order", { status: 500 });
  }
};
