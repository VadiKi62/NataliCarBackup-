import React from "react";
import { Box, Typography, Stack } from "@mui/material";

function LegendCalendarAdmin() {
  return (
    <Stack spacing={2} direction="row" margin={3}>
      {" "}
      <Box
        sx={{
          justifyContent: "center",
          display: "flex",
          alignItems: "center",
          alignContent: "center",
        }}
      >
        <Box
          component="span"
          sx={{
            display: "inline-block",
            width: "20px",
            height: "20px",
            backgroundColor: "primary.red",
            marginRight: "10px",
          }}
        ></Box>
        <Typography component="span" variant="body2">
          Подтвержденные брони
        </Typography>
      </Box>
      <Box
        sx={{ marginBottom: "10px", justifyContent: "center", display: "flex" }}
      >
        <Box
          component="span"
          sx={{
            display: "inline-block",
            width: "20px",
            height: "20px",
            backgroundColor: "primary.green",
            marginRight: "10px",
          }}
        ></Box>
        <Typography component="span" variant="body2">
          Неподтвержденные брони
        </Typography>
      </Box>
      {/* <Box
        sx={{ marginBottom: "10px", justifyContent: "center", display: "flex" }}
      >
        <Box
          component="span"
          sx={{
            position: "relative",
            display: "inline-block",
            width: "20px",
            height: "20px",
            backgroundColor: "text.green",
            marginRight: "10px",
          }}
        >
          {" "}
          <Box
            sx={{
              position: "absolute",
              height: "100%",
              //   backgroundColor: "primary.main",
              left: "50%",
              color: "white",
              transform: "translateX(-50%)",
              borderRight: "2px dotted",
            }}
          />
        </Box>
        <Typography component="span" variant="body2">
          Конец аренды и начало новой аренды в один день
        </Typography>
      </Box> */}
      <Box
        sx={{
          marginBottom: "10px",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <Box
          component="span"
          sx={{
            position: "relative",
            display: "inline-block",
            width: "20px",
            height: "22px",
            backgroundColor: "text.green",
            marginRight: "10px",
            color: "text.red",
            justifyContent: "center",
            alignContent: "center",
            display: "flex",
          }}
        >
          1
          {/* <Box
            sx={{
              position: "absolute",
              height: "100%",
              width: "1px",
              backgroundColor: "primary.main",
              // left: `${35 + 1 * 15}%`, // Spacing lines evenly across the box
              // transform: "translateX(-50%)",
            }}
          /> */}
        </Box>

        <Typography component="span" variant="body2">
          Конфликтующие даты бронирования
        </Typography>
      </Box>
    </Stack>
  );
}

export default LegendCalendarAdmin;
