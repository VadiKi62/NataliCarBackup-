// import { Rest } from "@models/rest";
// import { Menu } from "@models/menu";
// // import { generateCategories } from "@utils/functions";
// import { tomenu } from "@utils/initialMenus";
// import { connectToDB } from "@utils/database";

// export const GET = async (request) => {
//   try {
//     await connectToDB();

//     const getEnglishItemById = (id) => {
//       const enMenuItem = tomenu.menu.find(
//         (menuItem) => menuItem.langKey === "en"
//       );
//       const item = enMenuItem.items.find((item) => item.menuNumber === id);
//       return {
//         price: item.price,
//         image: item.image,
//       };
//     };

//     const menuData = tomenu.menu.map((menuItem) => {
//       return {
//         langKey: menuItem.langKey,
//         items: menuItem.items.map((item) => ({
//           menuNumber: item.menuNumber,
//           image: getEnglishItemById(item.menuNumber).image,
//           weight: item.weight,
//           per: item.per,
//           title: item.title,
//           price: getEnglishItemById(item.menuNumber).price,
//           category: item.category,
//           subCategory: item?.subCategory,
//           ingredients: item.ingredients,
//           isActive: item?.isActive || true,
//         })),
//       };
//     });

//     const data = {
//       menu: menuData,
//       restId: tomenu?.restId || "664c6f2346bcd27176505636",
//     };

//     const doesRestExist = await Rest.findById(data.restId);

//     if (!doesRestExist) {
//       console.log("this rest doesn't exist");
//       return new Response("this rest doesn't exist", {
//         status: 400,
//       });
//     }

//     const isMenuForRestexist = await Menu.findOne({ restId: data.restId });

//     if (isMenuForRestexist) {
//       return new Response("this menu already exist", {
//         status: 300,
//       });
//     }
//     const createdMenu = new Menu(data);

//     doesRestExist.menu = createdMenu._id;
//     await doesRestExist.save();
//     await createdMenu.save();

//     return new Response("SUCCESSSSSS", { status: 200 });
//   } catch (error) {
//     return new Response(`Internal Server Error: ${JSON.stringify(error)} `, {
//       status: 500,
//     });
//   }
// };

// export const POST = async (request) => {
//   try {
//     await connectToDB();

//     const menuData = tomenu.menu.map((menuItem) => ({
//       langKey: menuItem.langKey,
//       items: menuItem.items.map((item) => ({
//         menuNumber: item.menuNumber,
//         image: item.image,
//         weight: item.weight,
//         per: item.per,
//         title: item.title,
//         price: item.price,
//         category: item.category,
//         subCategory: item?.subCategory,
//         ingredients: item.ingredients,
//         isActive: item?.isActive || true,
//       })),
//     }));

//     const data = {
//       menu: menuData,
//       restId: tomenu?.restId || "664c6f2346bcd27176505636",
//     };

//     const doesRestExist = await Rest.findById(data.restId);

//     if (!doesRestExist) {
//       console.log("this rest doesn't exist");
//       return new Response("this rest doesn't exist", {
//         status: 400,
//       });
//     }

//     // const isMenuForRestexist = await Menu.findOne({ restId: data.restId });

//     // if (isMenuForRestexist) {
//     //   return new Response("this menu already exist", {
//     //     status: 300,
//     //   });
//     // }
//     const createdMenu = new Menu(data);

//     doesRestExist.menu = createdMenu._id;
//     await doesRestExist.save();
//     await createdMenu.save();

//     return new Response("SUCCESSSSSS", { status: 200 });
//   } catch (error) {
//     return new Response(`Internal Server Error: ${JSON.stringify(error)} `, {
//       status: 500,
//     });
//   }
// };
