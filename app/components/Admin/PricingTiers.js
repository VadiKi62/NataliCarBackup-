import { DataGrid } from "@mui/x-data-grid";
import { Grid, Typography } from "@mui/material";
import React, { useState } from "react";
import { seasons } from "@utils/seasons";

function returnSeasonDatesString(s) {
  const datesObject = seasons[s];
  if (!datesObject) {
    return `Season "${s}" not found in seasons object.`;
  }
  let string = `${datesObject.start}-${datesObject.end}`;
  return string;
}

// Define the columns for the DataGrid
// Define columns for the DataGrid
const columns = [
  { field: "season", headerName: "Season", width: 150 },
  { field: "seasonDates", headerName: "Season Dates", width: 200 },
  {
    field: "days1",
    headerName: "1-4 days",
    type: "number",
    width: 120,
    editable: true,
  },
  {
    field: "days7",
    headerName: "7-14 days",
    type: "number",
    width: 120,
    editable: true,
  },
  {
    field: "days14",
    headerName: "14+ days",
    type: "number",
    width: 120,
    editable: true,
  },
];
const PricingTiersTable = ({ car = {}, handlePricingTierChange }) => {
  const [rows, setRows] = useState(() => {
    const data = [];
    for (const [season, pricing] of Object.entries(car?.pricingTiers)) {
      data.push({
        id: season,
        season: season,
        seasonDates: returnSeasonDatesString(season),
        days1: pricing.days[4] || 0,
        days7: pricing.days[7] || 0,
        days14: pricing.days[14] || 0,
      });
    }
    return data;
  });

  const handleCellEditCommit = (params) => {
    const { id, field, value } = params;

    // Update the state to reflect changes in the DataGrid
    setRows((prevRows) => {
      const updatedRows = prevRows.map((row) => {
        if (row.id === id) {
          return {
            ...row,
            [field]: value,
          };
        }
        return row;
      });

      // Call the pricing tier change handler
      const season = id; // Use season as id
      const day = field.replace("days", ""); // field name (days1, days7, etc.), removing 'days' prefix
      handlePricingTierChange(season, day, value);
      return updatedRows;
    });
  };

  return (
    <Grid item xs={12}>
      <Typography variant="h6" gutterBottom>
        Цены :
      </Typography>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          onCellEditCommit={handleCellEditCommit} // Handle edits in the DataGrid
        />
      </div>
    </Grid>
  );
};

export default PricingTiersTable;
