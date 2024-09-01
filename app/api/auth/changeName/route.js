import { Menu } from "@models/menu";
import { connectToDB } from "@utils/database";

export const PATCH = async (req, { params }) => {
  try {
    await connectToDB();

    const rawBody = await req.text();
    let reqBody;
    try {
      reqBody = JSON.parse(rawBody);
    } catch (e) {
      console.error("Error parsing JSON:", e);
      return new Response(JSON.stringify({ message: "Invalid JSON" }), {
        status: 400,
      });
    }

    const { restId, menuNumber, newName, lang } = reqBody;

    const menu = await Menu.findOneAndUpdate(
      {
        restId,
        "menu.langKey": lang,
        "menu.items.menuNumber": menuNumber,
      },
      {
        $set: { "menu.$.items.$[item].title": newName },
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
      JSON.stringify({ message: "Name updated successfully", menu }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Failed to update name" }), {
      status: 500,
    });
  }
};
