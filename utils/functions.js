export function generateCategories(menu) {
  // Initialize an empty array to store categories
  let categories = [];
  const langKeys = extractLangKeys(menu);

  // Iterate over menu items for the first language
  menu[0].items.forEach((menuItem) => {
    const { category } = menuItem;

    // Check if category already exists in categories
    let existingCategory = categories.find(
      (el) => el.name && el.name[0] === category
    );

    // If not, add a new category entry to the array
    if (!existingCategory) {
      categories.push({ name: [category], ids: [menuItem.menuNumber] });
    } else existingCategory.ids.push(menuItem.menuNumber);
  });

  // Handle subcategories forthe 1st langusage
  menu[0].items.forEach((menuItem) => {
    const subCategory = menuItem?.subCategory || null;
    if (subCategory) {
      // Check if subcategory already exists in categories
      let existingSubCategory = categories.find(
        (el) => el.subName && el.subName[0] === subCategory
      );

      // If not, add a new subcategory entry to the array
      if (!existingSubCategory) {
        categories.push({ subName: [subCategory], ids: [menuItem.menuNumber] });
      } else existingSubCategory.ids.push(menuItem.menuNumber);
    }
  });

  const indexes = Array.from({ length: langKeys.length }, (_, index) => index);

  // Iterate over all languages and merge subcategories based on ids

  indexes.forEach((index) => {
    menu[index].items.forEach((item) => {
      categories.forEach((cat) => {
        if (cat.name && cat.ids.includes(item.menuNumber)) {
          if (!cat.name.includes(item.category)) {
            cat.name.push(item.category);
          }
        }
        // Check for subcategories
        if (cat.subName) {
          // Check if the item's menuNumber is in the subcategory's ids
          if (cat.ids.includes(item.menuNumber)) {
            // Check if the item's subCategory is not already in the subcategory's name array
            if (!cat.subName.includes(item.subCategory)) {
              cat.subName.push(item.subCategory); // Add the subcategory to the subName array
            }
          }
        }
      });
    });
  });

  // Create a result object with unique category and subcategory values
  let result = {};
  categories.forEach((el, i) => {
    if (el.name) {
      result[i + 1] = el.name;
    }
    if (el.subName) {
      result[i + 100] = el.subName;
    }
  });

  return result;
}

export const getLangMenu = (menu, lang = "en") => {
  let menuLang = menu.find((item) => item.langKey === lang);
  if (!menuLang) {
    return menu.find((item) => item.langKey === "en").items;
  }
  return menuLang.items;
};

function extractLangKeys(menu) {
  // Initialize an empty array to store langKeys
  const langKeys = [];

  // Iterate over each object in the menu array
  menu.forEach((langObject) => {
    // Extract langKey from the current object and push it to langKeys array
    langKeys.push(langObject.langKey);
  });

  // Return the array of langKeys
  return langKeys;
}

export function getCategoryId(categoryStr, categories) {
  // Find ID associated with this category in any language
  // console.log("111", categoryStr);
  for (const categoryId in categories) {
    if (categories[categoryId].includes(categoryStr)) {
      return categoryId;
    }
  }
}

export const getUniqueCategories = (menu, lang, categories) => {
  // Use Set to collect unique categories
  const menuInLang =
    menu.find((item) => item.langKey === lang) ||
    menu.find((item) => item.langKey === "en");
  const categoriesSet = new Set(
    menuInLang.items.map((menuItem) => menuItem.category)
  );

  // Convert Set back to an array
  const uniqueCategories = [...categoriesSet];

  const uniqueCategorieswithIds = uniqueCategories.map((cur) => {
    const id = getCategoryId(cur, categories);
    return { [id]: cur };
  });

  return { cat: uniqueCategories, ids: uniqueCategorieswithIds };
};

export const menuWithIds = (menu, categories) => {
  const updatedMenu = [];

  for (const { langKey, items } of menu) {
    const updatedItems = items.map((item) => {
      const categoryId = getCategoryId(item.category, categories);
      const plainItem = item.toObject();
      return {
        ...plainItem,
        category_id: categoryId,
      };
    });

    updatedMenu.push({ langKey, items: updatedItems });
  }

  return updatedMenu;
};

export function getSubcategories(menu, categories, categoryId, lang) {
  const menuLang = getLangMenu(menu, lang);
  const subCategoriesArray = menuLang.reduce(function (acc, cur) {
    if (cur.category_id == categoryId) {
      const subCategory = cur?.subCategory || "others";
      if (!acc.includes(subCategory)) {
        acc.push(subCategory);
      }
    }
    return acc;
  }, []);
  // Transform subCategoriesArray into an array of objects
  const subCategoriesObjectsArray = subCategoriesArray.map((subcategory) => {
    const id = getCategoryId(subcategory, categories);
    return { [id]: subcategory };
  });

  return { name: subCategoriesArray, ids: subCategoriesObjectsArray };
}

export const filterMenuItemsId = (menu, categoryId, lang, sub = null) => {
  const menuLang = getLangMenu(menu, lang);
  const filteredItems = menuLang.filter((item) => {
    if (categoryId === "*") return true;
    return item.category_id == categoryId;
  });
  if (sub === null) {
    return filteredItems;
  } else if (sub === "others") {
    return filteredItems.filter((item) => !item.subCategory);
  } else if (typeof sub === "string") {
    return filteredItems.filter((item) => item.subCategory === sub);
  }
  return filteredItems;
};

export const updateNameInEnglish = async (restId, menuNumber, newName) => {
  try {
    const apiUrl = `/api/menu/updateNameEn`;
    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ restId, menuNumber, newName }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update name of the menu item with number ${menuNumber} in English`
      );
    }

    const updatedMenu = await response.json();
    return updatedMenu;
  } catch (error) {
    console.error(
      `Error updating name in English with rest ID ${restId} and menu number ${menuNumber}:`,
      error
    );
    throw error;
  }
};
