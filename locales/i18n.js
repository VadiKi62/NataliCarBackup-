import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationsEn from "./en.json";

const resources = {
  en: {
    translation: translationsEn,
  },
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  supportedLngs: ["en", "gr"],
  debug: true,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
