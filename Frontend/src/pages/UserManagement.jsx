// UserManagement.jsx
import React, { useState } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import useUserManagement from "../hooks/UserManagementHooks";

function UserManagement() {
  // Use object destructuring here:
  const { usersManage, usersLoading } = useUserManagement();
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = usersManage.filter((user) =>
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => a.user_id - b.user_id);

  return (
    <div className="container-fluid p-3">
      {usersLoading ? (
        <HarvestSkeliton />
      ) : (
        <Paper
          sx={{
            width: "100%",
            overflow: "hidden",
            borderRadius: "10px",
            boxShadow: 15,
            padding: 2,
            mb: 5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: "bold",
                fontSize: "clamp(0.875rem, 1.7vw, 2rem)",
              }}
            >
              USER MANAGEMENT
            </Typography>
            <TextField
              label="Search Users"
              variant="outlined"
              size="small"
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <TableContainer>
            <Table sx={{ minWidth: 650, backgroundColor: "#fff" }}>
              <TableHead>
                <TableRow
                  sx={{ backgroundColor: "#4169E1", borderRadius: "10px" }}
                >
                  {[
                    "First Name",
                    "Last Name",
                    "Email",
                    "Phone",
                    "Address",
                    "DOB",
                    "Active",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        color: "#fff",
                        fontSize: "1.1rem",
                        py: 2.5,
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow
                      key={user.user_id}
                      hover
                      sx={{ borderRadius: "10px" }}
                    >
                      {[
                        user.first_name,
                        user.last_name,
                        user.email,
                        user.phone_number,
                        user.address,
                        new Date(user.date_of_birth).toLocaleDateString(),
                        user.isActive ? "Yes" : "No",
                      ].map((value, index) => (
                        <TableCell
                          key={index}
                          align="center"
                          sx={{ fontSize: "1.0rem", py: 1.5 }}
                        >
                          {value}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 2,
            }}
          >
            <TablePagination
              component="div"
              count={sortedUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              rowsPerPageOptions={[rowsPerPage]}
            />
          </Box>
        </Paper>
      )}
    </div>
  );
}

export default UserManagement;
