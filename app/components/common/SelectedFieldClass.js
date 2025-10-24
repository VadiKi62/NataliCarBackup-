"use client";

import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
} from "@mui/material";

const SelectedFieldClass = ({
  name,
  label,
  options,
  value,
  handleChange,
  required = false,
  isLoading = false,
}) => {
  // detect small landscape phones
  const isLandscapeSmall = useMediaQuery(
    "(max-width:900px) and (orientation: landscape)"
  );

  return (
    <FormControl
      fullWidth={false} // Отключаем fullWidth для лучшего контроля ширины
      required={required}
      sx={{
        mt: 1,
        minWidth: { xs: 160, sm: 280 }, // Минимальная ширина для адаптивности
        maxWidth: { xs: 180, sm: 300 }, // Максимальная ширина
        "& .MuiInputBase-root": {
          color: "white", // Text color inside the input field
          fontSize: { xs: "0.85rem", sm: "1rem" }, // Меньший размер текста на мобильных
        },
        "& .MuiInputLabel-root": {
          color: "white", // Label color
          fontSize: { xs: "0.75rem", sm: "1rem" }, // Меньший размер шрифта на мобильных
        },
        "& .MuiSelect-icon": {
          color: "white", // Arrow icon color
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "white", // Border color on focus
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
          {
            borderColor: "white", // Border color when focused
          },
      }}
      disabled={isLoading}
    >
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        labelId={`${name}-label`}
        size={isLandscapeSmall ? "small" : "medium"}
        name={name}
        value={value || "All"}
        onChange={handleChange}
        label={label}
      >
        <MenuItem value="All">All</MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectedFieldClass;
