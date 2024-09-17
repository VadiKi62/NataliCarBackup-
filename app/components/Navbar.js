"use client";
import { useState, useRef, useEffect } from "react";
import { styled } from "@mui/system";
import {
  AppBar,
  Button,
  Typography,
  Stack,
  Toolbar,
  Container,
  IconButton,
  Popover,
  MenuItem,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { animateScroll as scroll } from "react-scroll";
import { companyData } from "@utils/companyData";

const AppStyling = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  fontFamily: theme.typography.h1.fontFamily,
  zIndex: 996,
  position: "sticky",
  top: 0,
  minWidth: "100%",
  height: "60px",
  paddingBottom: "1px",
}));

const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: theme.typography.h1?.fontWeight || 400,
  display: "flex",
  fontSize: 29,
  fontFamily: theme.typography.h1.fontFamily,
  color: theme.palette.text.light,
}));

const LogoImg = styled(Image)(({ theme }) => ({
  // marginBottom: "-5px",
  // marginTop: "-4px",
  marginLeft: "1rem",
  // display: "flex",
}));

// const AboutButton = styled(ScrollLink)(({ theme, lang }) => ({
//   fontSize: lang === "en" ? "17px" : "13px",
//   padding: 0,
//   color: theme.palette.text.light,
//   fontFamily: theme.typography.allVariants.fontFamily,
//   fontWeight: 700,
//   cursor: "pointer",
//   display: "flex",
//   "&:hover": {
//     fontSize: "22px",
//     fontWeight: 900,
//   },
// }));

const LanguageSwitcher = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text?.black || theme.palette.text?.light,
  display: "flex",
  alignItems: "center",
}));

const LanguagePopover = styled(Popover)(({ theme }) => ({
  width: "150px",
  fontFamily: theme.typography.fontFamily,
}));

export default function NavBar() {
  const headerRef = useRef(0);
  // const { setLang, restData, isSmallScreen } = useMainContext();
  const [languageAnchor, setLanguageAnchor] = useState(null);
  const { i18n, t } = useTranslation();
  const lang = i18n.language;

  const handleLanguageClick = (event) => {
    event.preventDefault();
    setLanguageAnchor(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLanguageAnchor(null);
  };

  const handleLanguageSelect = (selectedLanguage) => {
    i18n.changeLanguage(selectedLanguage);
    handleLanguageClose();
  };

  const [scrolled, setScrolled] = useState("false");

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    setScrolled((scrollPosition > 80).toString());
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const width = scrolled === "true" ? 40 : 80;
  return (
    <AppStyling ref={headerRef}>
      <Toolbar>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          // marginTop={"-0.6rem"}
          sx={{ width: "100%" }}
        >
          {/* <LogoImg
            src="/logos/h1.png"
            width={200}
            height={48}
            alt="to kati allo"
            priority
          ></LogoImg> */}
          <Link href="/">
            <Logo>{companyData.name}</Logo>
          </Link>
          <Stack direction="row" spacing={2} alignItems="center">
            <LanguageSwitcher color="inherit" onClick={handleLanguageClick}>
              <LanguageIcon />
            </LanguageSwitcher>
          </Stack>
        </Stack>
        <LanguagePopover
          open={Boolean(languageAnchor)}
          anchorEl={languageAnchor}
          onClose={handleLanguageClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={() => handleLanguageSelect("en")}>
            English
          </MenuItem>
          <MenuItem onClick={() => handleLanguageSelect("el")}>
            Ελληνικά
          </MenuItem>
          <MenuItem onClick={() => handleLanguageSelect("ru")}>
            Русский
          </MenuItem>
          <MenuItem onClick={() => handleLanguageSelect("de")}>
            {" "}
            Deutsch
          </MenuItem>
          <MenuItem onClick={() => handleLanguageSelect("ro")}>
            {" "}
            Română
          </MenuItem>
          <MenuItem onClick={() => handleLanguageSelect("sr")}>
            {" "}
            Српски
          </MenuItem>
          <MenuItem onClick={() => handleLanguageSelect("bg")}>
            {" "}
            Български
          </MenuItem>
          <MenuItem onClick={() => handleLanguageSelect("fr")}>
            {" "}
            Française
          </MenuItem>
          <MenuItem onClick={() => handleLanguageSelect("ar")}>
            {" "}
            Arabic
          </MenuItem>
        </LanguagePopover>
      </Toolbar>
    </AppStyling>
  );
}
