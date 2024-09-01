import { Menu } from "@models/menu";
import { connectToDB } from "@utils/database";

export const PUT = async (req, { params }) => {
  try {
    await connectToDB();
    // Read the raw body content

    const rawBody = await req.text();

    // Attempt to parse the JSON
    let reqBody;
    try {
      reqBody = JSON.parse(rawBody);
    } catch (e) {
      console.error("Error parsing JSON:", e);
      return new Response(JSON.stringify({ message: "Invalid JSON" }), {
        status: 400,
      });
    }

    const { restId, menuNumber, newPrice } = reqBody;

    // Find the menu by restId and update the price for the item with the specific menuNumber in "en" langKey
    const menu = await Menu.findOneAndUpdate(
      {
        restId,
        "menu.langKey": "en",
        "menu.items.menuNumber": menuNumber,
      },
      {
        $set: { "menu.$.items.$[item].price": newPrice },
      },
      {
        arrayFilters: [{ "item.menuNumber": menuNumber }],
        new: true,
      }
    );

    if (!menu) {
      return new Response(JSON.stringify({ message: "Menu item not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({ message: "Price updated successfully", menu }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Failed to update price" }), {
      status: 500,
    });
  }
};
