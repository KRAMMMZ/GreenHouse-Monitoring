import React from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const FilterSearchSection = ({
  harvestSearchTerm,
  setHarvestSearchTerm,
  harvestFilter,
  handleFilterChange,
  openDateModalHandler,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
        HARVESTED ITEMS
      </Typography>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={harvestSearchTerm}
          onChange={(e) => setHarvestSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: "100%", sm: "100%", md: "auto" } }}
        />
        <FormControl
          variant="outlined"
          size="small"
          sx={{ width: { xs: "100%", sm: "100%", md: "auto" } }}
        >
          <InputLabel>Filter</InputLabel>
          <Select label="Filter" value={harvestFilter} onChange={handleFilterChange}>
            <MenuItem value="ALL">ALL</MenuItem>
            <MenuItem value="CURRENT DAY">CURRENT DAY</MenuItem>
            <MenuItem value="LAST 7 DAYS">LAST 7 DAYS</MenuItem>
            <MenuItem value="THIS MONTH">THIS MONTH</MenuItem>
            
            <MenuItem value="CHOOSE DATE" onMouseDown={openDateModalHandler}>
              CHOOSE DATE
            </MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default FilterSearchSection;
