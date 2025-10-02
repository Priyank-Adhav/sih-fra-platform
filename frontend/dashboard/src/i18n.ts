import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/translation.json";
import hi from "./locales/hi/translation.json";
import bn from "./locales/bn/translation.json";
import or from "./locales/or/translation.json";
import te from "./locales/te/translation.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      bn: { translation: bn },
      or: { translation: or },
      te: { translation: te }
    },
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
