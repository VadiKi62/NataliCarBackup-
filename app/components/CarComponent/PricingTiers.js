import { Box, Stack, Typography, Paper, Divider } from "@mui/material";

const PricingDisplay = ({ prices }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        padding: { xs: 1.8, sm: 3 },
        display: "flex",
        justifyContent: "space-evenly",
        alignItems: "center",
        backgroundColor: "secondary.light",
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          padding: 0,
        }}
      >
        {Object.entries(prices).map(([days, amount], index) => (
          <>
            <Typography
              color="textPrimary"
              sx={{
                lineHeight: { xs: "0.9rem", sm: "1.1rem" },
                fontSize: { xs: "0.8rem", sm: "1rem" },
              }}
            >
              {days} days
            </Typography>

            <Typography
              sx={{
                lineHeight: { xs: "1rem", sm: "1.2rem" },
                fontSize: { xs: "1rem", sm: "1.2rem" },
              }}
              color="primary"
            >
              ${amount}
            </Typography>
            {index + 1 < Object.entries(prices).length && (
              <Divider orientation="vertical" flexItem />
            )}
          </>
        ))}
      </Stack>
    </Paper>
  );
};

export default PricingDisplay;
