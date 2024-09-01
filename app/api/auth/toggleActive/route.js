import { Menu } from "@models/menu";
import { connectToDB } from "@utils/database";

export const PATCH = async (req, { params }) => {
  try {
    await connectToDB();

    // Read the raw body content
    const rawBody = await req.text();
    console.log("Raw Body:", rawBody);

    // Attempt to parse the JSON
    let reqBody;
    try {
      reqBody = JSON.parse(rawBody);
      console.log("reqBody", reqBody);
    } catch (e) {
      console.error("Error parsing JSON:", e);
      return new Response(JSON.stringify({ message: "Invalid JSON" }), {
        status: 400,
      });
    }

    const { restId, menuNumber } = reqBody;

    // Find the menu by restId and get the current isActive status for the item with the specific menuNumber in "en" langKey
    const menu = await Menu.findOne({
      restId,
      "menu.langKey": "en",
      "menu.items.menuNumber": menuNumber,
    });

    if (!menu) {
      return new Response(JSON.stringify({ message: "Menu item not found" }), {
        status: 404,
      });
    }

    // Find the specific item
    const menuItem = menu.menu
      .find((menu) => menu.langKey === "en")
      .items.find((item) => item.menuNumber === menuNumber);

    if (!menuItem) {
      return new Response(JSON.stringify({ message: "Menu item not found" }), {
        status: 404,
      });
    }

    const newIsActive = !menuItem.isActive;

    // Update the isActive status
    const updatedMenu = await Menu.findOneAndUpdate(
      {
        restId,
        "menu.langKey": "en",
        "menu.items.menuNumber": menuNumber,
      },
      {
        $set: { "menu.$.items.$[item].isActive": newIsActive },
      },
      {
        arrayFilters: [{ "item.menuNumber": menuNumber }],
        new: true,
      }
    );

    return new Response(
      JSON.stringify({
        message: "isActive status updated successfully",
        menu: updatedMenu,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Failed to update isActive status" }),
      {
        status: 500,
      }
    );
  }
};
