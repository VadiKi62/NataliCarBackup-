// Компонент для отображения информации о языке браузера (только для тестирования)
"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";

const BrowserLanguageInfo = () => {
  const [browserInfo, setBrowserInfo] = useState(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    // Собираем информацию о языке браузера
    const detectBrowserLanguage = () => {
      const supportedLngs = ["en", "el", "ru"];
      let detectedLang = "en"; // fallback

      // Проверяем navigator.languages
      if (navigator.languages && navigator.languages.length > 0) {
        for (const lang of navigator.languages) {
          // Проверяем полное соответствие (например, "ru")
          if (supportedLngs.includes(lang)) {
            detectedLang = lang;
            break;
          }
          // Проверяем соответствие по первой части (например, "ru-RU" -> "ru")
          const shortLang = lang.split("-")[0];
          if (supportedLngs.includes(shortLang)) {
            detectedLang = shortLang;
            break;
          }
        }
      }

      // Fallback к navigator.language
      if (detectedLang === "en" && navigator.language) {
        const browserLang = navigator.language;
        if (supportedLngs.includes(browserLang)) {
          detectedLang = browserLang;
        } else {
          const shortLang = browserLang.split("-")[0];
          if (supportedLngs.includes(shortLang)) {
            detectedLang = shortLang;
          }
        }
      }

      return {
        primaryLanguage: navigator.language,
        allLanguages: navigator.languages || [],
        detectedSupportedLanguage: detectedLang,
        currentI18nLanguage: i18n.language,
        savedLanguage: localStorage.getItem("selectedLanguage"),
        supportedLanguages: supportedLngs,
      };
    };

    setBrowserInfo(detectBrowserLanguage());
  }, [i18n.language]);

  // Этот компонент только для разработки, не показываем его в продакшене
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  if (!browserInfo) return null;

  return (
    <Paper
      sx={{
        position: "fixed",
        top: 10,
        right: 10,
        p: 2,
        backgroundColor: "rgba(255,255,255,0.9)",
        zIndex: 9999,
        maxWidth: "300px",
        fontSize: "12px",
      }}
    >
      <Typography variant="h6" gutterBottom>
        🌐 Language Detection Info
      </Typography>

      <Typography variant="body2">
        <strong>Primary Browser Language:</strong>
        <br />
        {browserInfo.primaryLanguage}
      </Typography>

      <Typography variant="body2" sx={{ mt: 1 }}>
        <strong>All Browser Languages:</strong>
        <br />
        {browserInfo.allLanguages.join(", ") || "Not available"}
      </Typography>

      <Typography variant="body2" sx={{ mt: 1 }}>
        <strong>Detected Supported Language:</strong>
        <br />
        {browserInfo.detectedSupportedLanguage}
      </Typography>

      <Typography variant="body2" sx={{ mt: 1 }}>
        <strong>Current i18n Language:</strong>
        <br />
        {browserInfo.currentI18nLanguage}
      </Typography>

      <Typography variant="body2" sx={{ mt: 1 }}>
        <strong>Saved in localStorage:</strong>
        <br />
        {browserInfo.savedLanguage || "None"}
      </Typography>

      <Typography variant="body2" sx={{ mt: 1 }}>
        <strong>Supported Languages:</strong>
        <br />
        {browserInfo.supportedLanguages.join(", ")}
      </Typography>
    </Paper>
  );
};

export default BrowserLanguageInfo;
