"use client";
import { useState, useRef, useEffect } from "react";
import { styled } from "@mui/system";
import Image from "next/image";
import Link from "next/link";
import { animateScroll as scroll } from "react-scroll";
import {
  AppBar,
  Button,
  Typography,
  Box,
  Stack,
  Toolbar,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Popover,
  MenuItem,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import LanguageIcon from "@mui/icons-material/Language";
import { companyData } from "@utils/companyData";
import { useMainContext } from "@app/Context";
import LegendCalendarAdmin from "./common/LegendCalendarAdmin";
import { CAR_CLASSES } from "@models/enums";
import SelectedFieldClass from "./common/SelectedFieldClass";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

// Styled components (unchanged or slightly adjusted)
const StyledBox = styled(Box)(({ theme }) => ({
  zIndex: 996,
  position: "fixed",
  top: 50,
  left: 0,
  width: "100%",
  display: "flex",
  justifyContent: "center",
  py: theme.spacing(1),
  backgroundColor: theme.palette.primary.main1,
}));

const GradientAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "scrolled",
})(({ theme, scrolled }) => ({
  width: "100%",
  position: "fixed",
  transition: theme.transitions.create(["height", "background-color"], {
    duration: theme.transitions.duration.standard,
    easing: theme.transitions.easing.easeInOut,
  }),
  willChange: "height, background-color",
  height: scrolled ? 52 : 60,
  backgroundColor: theme.palette.primary.main1,
  boxShadow: "none",
  backdropFilter: scrolled ? "blur(10px)" : "none",
}));

const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: theme.typography.h1?.fontWeight || 400,
  fontFamily: theme.typography.h1.fontFamily,
  color: theme.palette.text.red,
}));

const LanguageSwitcher = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text?.black || theme.palette.text?.light,
  display: "flex",
  alignItems: "center",
}));

const LanguagePopover = styled(Popover)(({ theme }) => ({
  width: "150px",
  fontFamily: theme.typography.fontFamily,
}));

export default function NavBar({
  isMain,
  isAdmin = false,
  isCarInfo = false,
  setIsCarInfo = null,
}) {
  const headerRef = useRef(null);
  const [languageAnchor, setLanguageAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { i18n, t } = useTranslation();
  const {
    scrolled,
    setSelectedClass,
    selectedClass,
    arrayOfAvailableClasses,
    lang,
    setLang,
  } = useMainContext();

  const handleCarClassChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedClass(selectedValue === "" ? "" : selectedValue);
  };

  const handleLanguageClick = (event) => {
    event.preventDefault();
    setLanguageAnchor(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLanguageAnchor(null);
  };

  const handleLanguageSelect = (selectedLanguage) => {
    setLang(selectedLanguage);
    i18n.changeLanguage(selectedLanguage);
    handleLanguageClose();
  };

  return (
    <>
      <GradientAppBar ref={headerRef} scrolled={scrolled}>
        <Toolbar>
          <Stack
            direction="row-reverse"
            alignItems="center"
            justifyContent="space-between"
            sx={{ width: "100%" }}
          >
            {/* Left side: navigation and drawer toggle */}
            <Stack alignItems="center" direction="row-reverse" spacing={2}>
              {/* Mobile Drawer Toggle (visible on xs) */}
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setDrawerOpen(true)}
                sx={{ display: { xs: "block", md: "none" } }}
              >
                <MenuIcon />
              </IconButton>
              {/* Desktop Navigation Links (visible on md and up) */}
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ display: { xs: "none", md: "flex" } }}
              >
                {!isAdmin && (
                  <>
                    <Link href="/">
                      <Typography
                        sx={{
                          fontStretch: "extra-condensed",
                          textTransform: "uppercase",
                        }}
                      >
                        {t("header.main")}
                      </Typography>
                    </Link>
                    <Link href="/terms">
                      <Typography
                        sx={{
                          fontStretch: "extra-condensed",
                          textTransform: "uppercase",
                        }}
                      >
                        {t("header.terms")}
                      </Typography>
                    </Link>
                    <Link href="/contacts">
                      <Typography
                        sx={{
                          fontStretch: "extra-condensed",
                          textTransform: "uppercase",
                        }}
                      >
                        {t("header.contacts")}
                      </Typography>
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <>
                    <Link href="/admin/cars">
                      <Typography
                        sx={{
                          px: { xs: 0.5, md: 3 },
                          fontSize: { xs: 11, md: 15 },
                          textTransform: "uppercase",
                        }}
                      >
                        {t("header.cars")}
                      </Typography>
                    </Link>
                    <Link href="/admin/orders">
                      <Typography
                        sx={{
                          px: { xs: 0.5, md: 3 },
                          fontSize: { xs: 11, md: 15 },
                          textTransform: "uppercase",
                        }}
                      >
                        {t("header.orders")}
                      </Typography>
                    </Link>
                    <Link href="/admin/orders-calendar">
                      <Typography
                        sx={{
                          px: { xs: 0.5, md: 3 },
                          fontSize: { xs: 11, md: 15 },
                          textTransform: "uppercase",
                        }}
                      >
                        {t("header.calendar")}
                      </Typography>
                    </Link>
                    <ListItem button component={Link} href="/admin/table">
                      <ListItemText primary="Таблица заказов" />
                    </ListItem>
                  </>
                )}
                <LanguageSwitcher color="inherit" onClick={handleLanguageClick}>
                  <Typography
                    sx={{
                      fontStretch: "extra-condensed",
                      textTransform: "uppercase",
                    }}
                  >
                    {lang}
                  </Typography>
                </LanguageSwitcher>
              </Stack>
            </Stack>
            {/* Right side: Logo */}
            <Link href="/">
              <Logo
                sx={{
                  fontSize: "clamp(10px, calc(0.5rem + 1vw), 32px)",
                }}
              >
                {companyData.name}
                {isAdmin && " ADMIN"}
              </Logo>
            </Link>
          </Stack>
        </Toolbar>
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
        </LanguagePopover>
        {isMain && (
          <StyledBox scrolled={scrolled} isCarInfo={isCarInfo}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 10 }}
              alignItems="center"
              justifyContent="center"
              pb={1}
            >
              <LegendCalendarAdmin client={isMain} />
              <SelectedFieldClass
                name="class"
                label={t("header.carClass")}
                options={Object.values(arrayOfAvailableClasses)}
                value={selectedClass}
                handleChange={handleCarClassChange}
              />
            </Stack>
          </StyledBox>
        )}
      </GradientAppBar>

      {/* Mobile Drawer (opens from right) */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Link href="/">
              <Logo>
                {companyData.name}
                {isAdmin && " ADMIN"}
              </Logo>
            </Link>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <List>
            {!isAdmin && (
              <>
                <ListItem button component={Link} href="/">
                  <ListItemText primary={t("header.main")} />
                </ListItem>
                <ListItem button component={Link} href="/terms">
                  <ListItemText primary={t("header.terms")} />
                </ListItem>
                <ListItem button component={Link} href="/contacts">
                  <ListItemText primary={t("header.contacts")} />
                </ListItem>
                {/* Language Switcher in Drawer */}
                <ListItem button onClick={handleLanguageClick}>
                  <ListItemText primary={lang} />
                </ListItem>
              </>
            )}
            {isAdmin && (
              <>
                <ListItem button component={Link} href="/admin/cars">
                  <ListItemText primary={t("header.cars")} />
                </ListItem>
                <ListItem button component={Link} href="/admin/orders">
                  <ListItemText primary={t("header.orders")} />
                </ListItem>
                <ListItem button component={Link} href="/admin/orders-calendar">
                  <ListItemText primary={t("header.calendar")} />
                </ListItem>
                <ListItem button component={Link} href="/admin/table">
                  <ListItemText primary="Таблица заказов" />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}

const ToggleButtons = ({ isCarInfo, setIsCarInfo }) => {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={{ xs: 0.3, md: 3 }}
      alignItems="center"
    >
      <Button
        variant={isCarInfo ? "contained" : "outlined"}
        sx={{
          px: { xs: 0.5, md: 3 },
          fontSize: { xs: 6, md: 15 },
        }}
        onClick={() => setIsCarInfo(true)}
      >
        Автопарк
      </Button>
      <Button
        variant={!isCarInfo ? "contained" : "outlined"}
        sx={{
          px: { xs: 0.5, md: 3 },
          fontSize: { xs: 6, md: 15 },
        }}
        onClick={() => setIsCarInfo(false)}
      >
        Заказы
      </Button>
    </Stack>
  );
};
