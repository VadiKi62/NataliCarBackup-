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

// Функция для определения языка браузера
const detectBrowserLanguage = () => {
  const supportedLngs = ["en", "el", "ru"];

  // Проверяем navigator.languages (массив предпочитаемых языков)
  if (navigator.languages && navigator.languages.length > 0) {
    for (const lang of navigator.languages) {
      // Проверяем полное соответствие (например, "ru")
      if (supportedLngs.includes(lang)) {
        return lang;
      }
      // Проверяем соответствие по первой части (например, "ru-RU" -> "ru")
      const shortLang = lang.split("-")[0];
      if (supportedLngs.includes(shortLang)) {
        return shortLang;
      }
    }
  }

  // Fallback к navigator.language
  if (navigator.language) {
    const browserLang = navigator.language;
    if (supportedLngs.includes(browserLang)) {
      return browserLang;
    }
    const shortLang = browserLang.split("-")[0];
    if (supportedLngs.includes(shortLang)) {
      return shortLang;
    }
  }

  // Если ничего не найдено, возвращаем английский по умолчанию
  return "en";
};

// Получаем язык браузера только на стороне клиента
const getInitialLanguage = () => {
  // Проверяем, работаем ли мы в браузере
  if (typeof window !== "undefined") {
    // Сначала проверяем localStorage (если пользователь уже выбирал язык)
    const savedLang = localStorage.getItem("selectedLanguage");
    if (savedLang && ["en", "el", "ru"].includes(savedLang)) {
      return savedLang;
    }
    // Если в localStorage ничего нет, определяем по браузеру
    return detectBrowserLanguage();
  }
  // На сервере возвращаем английский по умолчанию
  return "en";
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(), // автоматическое определение языка
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
