import { Grid, Box, Typography } from "@mui/material";
import dayjs from "dayjs";

export default function ConflictMessage({ conflicts, type }) {
  if (!conflicts) return;
  return (
    <Box width="100%">
      <Typography
        variant="h6"
        color={type == 1 ? "primary.main" : "error"}
        sx={{ lineHeight: "1.2rem", my: 1 }}
      >
        {type == 1
          ? "Конфликтующие брони"
          : "Подтвержденные брони, из-за которых возник конфликт"}
      </Typography>

      <Grid container spacing={2}>
        {conflicts.map((o) => (
          <Grid item sx={12} sm={12} md={6} key={o._id}>
            <Box border={1} borderColor="grey.300" p={2} borderRadius={2}>
              <Typography variant="body1" fontWeight="bold">
                {o.customerName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Бронь с {dayjs(o.rentalStartDate).format("MMM D")} по{" "}
                {dayjs(o.rentalEndDate).format("MMM D")}
              </Typography>
              <Typography variant="body2">{o.email}</Typography>
              <Typography variant="body2">{o.phone}</Typography>
              <Typography
                variant="body2"
                color={o.confirmed ? "success.main" : "error"}
              >
                {o.confirmed ? "Подтвержден" : "НЕ Подтвержден"}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
