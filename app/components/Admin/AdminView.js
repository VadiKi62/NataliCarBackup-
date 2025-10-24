"use client";

import { Box } from "@mui/material";
import Admin from "./Admin";
import Feed from "@app/components/Feed";

export default function AdminView({ company, cars, orders, viewType }) {
  return (
    <Feed cars={cars} orders={orders} company={company} isAdmin isMain={false}>
      <Box sx={{ my: 3 }}>
        <Admin
          isCars={viewType === "cars"}
          isOrdersBigCalendar={viewType === "calendar"}
          isOrdersTable={viewType === "table"}
        />
      </Box>
    </Feed>
  );
}
