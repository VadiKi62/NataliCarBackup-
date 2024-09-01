// import { Menu } from "@models/menu";
// import { connectToDB } from "@utils/database";
// import {
//   generateCategories,
//   getCategoryId,
//   getUniqueCategories,
//   menuWithIds,
//   getSubcategories,
//   filterMenuItemsId,
// } from "@utils/functions";

// export const GET = async (request, { params }) => {
//   try {
//     await connectToDB();
//     console.log("Params from /menu/restId", params);

//     const menu = await Menu.findOne({ restId: params.restId });

//     if (!menu) {
//       return new Response("Rest Not Found", { status: 404 });
//     }
//     const categories = generateCategories(menu.menu);

//     const menuUpd = menuWithIds(menu.menu, categories);
//     const toReturn = {
//       categories: categories,
//       menu: menu,
//       menuUpd,
//     };
//     return new Response(JSON.stringify(toReturn), { status: 200 });
//   } catch (error) {
//     return new Response("Internal Server Error", { status: 500 });
//   }
// };
