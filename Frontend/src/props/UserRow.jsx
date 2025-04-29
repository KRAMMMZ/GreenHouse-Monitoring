// UserRow.jsx
import React from "react";
import { TableRow, TableCell, Button } from "@mui/material";

const cellStyle = {
  color:"#000",
  fontSize: { xs: "0.75rem", sm: "0.9rem", md: "1rem" },
  py: 1.5,
 
};

const UserRow = React.memo(({ user, formatDOB, onToggleUserStatus }) => (
  <TableRow   sx={{ borderRadius: "10px", backgroundColor:"#fff" ,   color:"#000", borderBottom:'none'}}>
    <TableCell align="center" sx={cellStyle}>
      {user.first_name}
    </TableCell>
    <TableCell align="center" sx={cellStyle}>
      {user.last_name}
    </TableCell>
    <TableCell align="center" sx={cellStyle}>
      {user.email}
    </TableCell>
    <TableCell align="center" sx={cellStyle}>
      {user.phone_number}
    </TableCell>
    <TableCell align="center" sx={cellStyle}>
      {user.address}  
    </TableCell>
    <TableCell align="center" sx={cellStyle}>
      {formatDOB(user.date_of_birth)}
    </TableCell>
    <TableCell align="center" sx={cellStyle}>
      {user.isActive ? "Yes" : "No"}
    </TableCell>
    <TableCell align="center" sx={cellStyle}>
      <Button
        variant="contained"
        onClick={() =>
          onToggleUserStatus(user.user_id, user.isActive, user.email)
        }
        sx={{
         
          backgroundColor: user.isActive ? "red" : "primary.main",
          "&:hover": {
            backgroundColor: user.isActive ? "darkred" : "primary.dark",
          },
        }}
      >
        {user.isActive ? "Deactivate" : "Activate"}
      </Button>
    </TableCell>
  </TableRow>
));

export default UserRow;
