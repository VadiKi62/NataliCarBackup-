import { DataGrid } from "@mui/x-data-grid";
import { Grid, Typography } from "@mui/material";
import React, { useState } from "react";
import { seasons } from "@utils/companyData";

function returnSeasonDatesString(s) {
  const datesObject = seasons[s];
  if (!datesObject) {
    return `Season "${s}" not found in seasons object.`;
  }
  let string = `${datesObject.start}-${datesObject.end}`;
  return string;
}

const columns = [
  { field: "season", headerName: "Season", width: 150 },
  { field: "seasonDates", headerName: "Season Dates", width: 200 },
];
const PricingTiersTable = ({ car = {}, handlePricingTierChange }) => {
  const [rows, setRows] = useState(() => {
    const data = [];
    for (const [season, pricing] of Object.entries(car?.pricingTiers)) {
      const daysData = {}; // Create a dynamic object to hold all days-related keys and values

      // Loop over all keys in pricing.days and assign them to the daysData object
      for (const [key, value] of Object.entries(pricing.days)) {
        daysData[`days${key}`] = value || 0;
      }

      data.push({
        id: season,
        season: season,
        seasonDates: returnSeasonDatesString(season),
        ...daysData,
      });
    }
    return data;
  });

  const dynamicDayColumns = Object.keys(
    car?.pricingTiers?.[Object.keys(car.pricingTiers)[0]]?.days || {}
  ).map((dayKey) => {
    let dayRange = "";
    // Customize the headerName based on the day key
    if (dayKey <= 5) {
      dayRange = "1-4 days";
    } else if (dayKey <= 7) {
      dayRange = "7-14 days";
    } else {
      dayRange = "14+ days";
    }

    return {
      field: `days${dayKey}`, // Dynamically use the dayKey for field name
      headerName: dayRange,
      type: "number",
      width: 120,
      editable: true,
    };
  });

  const allColumns = [...columns, ...dynamicDayColumns];

  const handleRowUpdate = (newRow, oldRow) => {
    const { id, ...updatedFields } = newRow;

    // Update the state to reflect changes in the DataGrid
    setRows((prevRows) => {
      const updatedRows = prevRows.map((row) =>
        row.id === id ? { ...row, ...updatedFields } : row
      );

      // Call the pricing tier change handler for each updated field
      Object.entries(updatedFields).forEach(([field, value]) => {
        const day = field.replace("days", ""); // Extract the day key
        handlePricingTierChange(id, day, value);
      });

      return updatedRows;
    });

    return newRow;
  };

  return (
    <Grid item xs={12}>
      <Typography variant="h6" gutterBottom>
        Цены :
      </Typography>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={allColumns}
          // pageSize={2}
          // rowsPerPageOptions={[3]}
          processRowUpdate={handleRowUpdate}
          initialState={{
            pagination: {
              // paginationModel: {
              //   pageSize: 5,
              // },
            },
          }}
          disableRowSelectionOnClick
        />
      </div>
    </Grid>
  );
};

export default PricingTiersTable;
