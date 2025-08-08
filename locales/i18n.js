// import i18n from "i18next";
// import { initReactI18next } from "react-i18next";
// import translationsEn from "./en.json";
// import translationsEl from "./el.json";
// import translationsRu from "./ru.json";

// const resources = {
//   en: {
//     translation: translationsEn,
//   },
//   el: {
//     translation: translationsEl,
//   },
//   ru: {
//     translation: translationsRu,
//   },
// };

// i18n.use(initReactI18next).init({
//   resources,
//   fallbackLng: "en",
//   supportedLngs: ["en", "el", "ru"],
//   debug: true,
//   interpolation: {
//     escapeValue: false,
//   },
// });

// export default i18n;

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationsEn from "./en.json";
import translationsEl from "./el.json";
import translationsRu from "./ru.json";

const resources = {
  en: { translation: translationsEn },
  el: { translation: translationsEl },
  ru: { translation: translationsRu },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // явно устанавливаем язык по умолчанию
  fallbackLng: "en", // язык, если перевод отсутствует
  supportedLngs: ["en", "el", "ru"],
  debug: process.env.NODE_ENV === "development", // debug только в development
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: true, // важно для React 18+
  },
});

export default i18n;
