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
import ViewListIcon from "@mui/icons-material/ViewList";
import TodayIcon from "@mui/icons-material/Today";
import CalendarViewWeekIcon from "@mui/icons-material/CalendarViewWeek";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DateRangeIcon from "@mui/icons-material/DateRange";
import EventIcon from "@mui/icons-material/Event";

const FilterSearchSection = ({
  harvestSearchTerm,
  setHarvestSearchTerm,
  harvestFilter,
  handleFilterChange,
  openDateModalHandler,
  openMonthModalHandler,
  filterDescription,
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
        HARVESTED ITEMS{" "}
        {filterDescription && (
          <span style={{ fontSize: "0.8rem", fontWeight: "normal", marginLeft: "10px" }}>
            ({filterDescription})
          </span>
        )}
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
            <MenuItem value="ALL">
              <ViewListIcon sx={{ mr: 1 }} />
              ALL
            </MenuItem>
            <MenuItem value="CURRENT DAY">
              <TodayIcon sx={{ mr: 1 }} />
              CURRENT DAY
            </MenuItem>
            <MenuItem value="LAST 7 DAYS">
              <CalendarViewWeekIcon sx={{ mr: 1 }} />
              LAST 7 DAYS
            </MenuItem>
            <MenuItem value="THIS MONTH">
              <CalendarMonthIcon sx={{ mr: 1 }} />
              THIS MONTH
            </MenuItem>
            <MenuItem value="SELECT MONTH" onMouseDown={openMonthModalHandler}>
              <DateRangeIcon sx={{ mr: 1 }} />
              SELECT MONTH
            </MenuItem>
            <MenuItem value="CHOOSE DATE" onMouseDown={openDateModalHandler}>
              <EventIcon sx={{ mr: 1 }} />
              CHOOSE DATE
            </MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default FilterSearchSection;
