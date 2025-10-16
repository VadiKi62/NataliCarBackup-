import { Order } from "@models/order";
import { connectToDB } from "@utils/database";

export const PUT = async (req) => {
  try {
    await connectToDB();

    const { _id, phone, email, customerName, flightNumber } = await req.json(); // Destructure only the allowed fields

    // Debug log to verify incoming payload (including flightNumber)
    console.log("API:update/customer - incoming payload:", {
      _id,
      phone,
      email,
      customerName,
      flightNumber,
    });

    // Filter the update to only include allowed fields
    const updateFields = {};
    if (phone) updateFields.phone = phone;
    updateFields.email = email; // Обновляем email даже если он пустой
    if (customerName) updateFields.customerName = customerName;
    // Allow updating flightNumber (accept empty string as valid)
    if (flightNumber !== undefined) updateFields.flightNumber = flightNumber;

    // Update the order with only the allowed fields
    const updatedOrder = await Order.findByIdAndUpdate(_id, updateFields, {
      new: true, // return the updated document
    });

    if (!updatedOrder) {
      return new Response(JSON.stringify({ message: "Заказ не найден" }), {
        status: 404,
        success: false,
      });
    }

    return new Response(
      JSON.stringify({
        updatedOrder,
        message: "Данные клиента обновлены успешно",
      }),
      {
        status: 200,
        success: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Ошибка. Данные клиента не обновлены" }),
      { status: 500, success: false }
    );
  }
};
