import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  IconButton,
  Button,
  Container,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import EmailIcon from "@mui/icons-material/Email";
import Swal from "sweetalert2";
import axios from "axios";

import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import useUserManagement from "../hooks/UserManagementHooks";
import UserRow from "../props/UserRow";
import SendEmailModal from "../components/SendEmailModal";
import VerificationModal from "../components/VerificationModal";

function UserManagement() {
  const { usersManage, usersLoading } = useUserManagement();
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState(true);
  const [users, setUsers] = useState([]);

  // Email Modal state
  const [openEmailModal, setOpenEmailModal] = useState(false);

  // Verification Modal state and selected user details
  const [openVerificationModal, setOpenVerificationModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Sync local users state with hook data.
  useEffect(() => {
    setUsers(usersManage);
  }, [usersManage]);

  // Toggle user status with SweetAlert confirmation then open the verification modal.
  const handleToggleUserStatus = useCallback(
    (user_id, currentActive, userEmail) => {
      Swal.fire({
        title: currentActive
          ? "Are you sure you want to deactivate?"
          : "Are you sure you want to activate?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      }).then((result) => {
        if (result.isConfirmed) {
          // Save the selected user details and open the verification modal.
          setSelectedUser({ user_id, currentActive, userEmail });
          setOpenVerificationModal(true);
        }
      });
    },
    []
  );

  // Handler for verification modal's verify action.
  const handleVerification = async (adminPassword) => {
    if (!selectedUser) return;
    const { user_id, currentActive, userEmail } = selectedUser;

    // Determine the verify endpoint based on the action.
    const verifyEndpoint = currentActive
      ? "http://localhost:3001/verify-user/deactivate"
      : "http://localhost:3001/verify-user/activate";

      Swal.fire({
        title: "Please wait...",
        text: "Loading...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      
    try {
      // Verify admin credentials. 
      await axios.post(
        verifyEndpoint,
        { email: userEmail, password: adminPassword },
        { withCredentials: true }
      );

      // After successful verification, trigger the activation/deactivation API.
      const activationEndpoint = currentActive
        ? "http://localhost:3001/admin/deactivate"
        : "http://localhost:3001/admin/activate";

      await axios.post(
        activationEndpoint,
        { email: userEmail },
        { withCredentials: true }
      );

      // Update the UI by toggling the user's isActive property.
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.user_id === user_id ? { ...user, isActive: !user.isActive } : user
        )
      );

      Swal.fire({
        title: currentActive ? "User deactivated!" : "User activated!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      // Close modal only on successful verification.
      setOpenVerificationModal(false);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text:
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message,
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      });
      // Modal remains open on error, allowing the admin to try again.
    }
  };

  // Convert search term to lowercase.
  const lowerCaseSearchTerm = useMemo(
    () => searchTerm.toLowerCase(),
    [searchTerm]
  );

  // Filter users based on search term and active status.
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.first_name.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.last_name.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.email.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.phone_number.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.address.toLowerCase().includes(lowerCaseSearchTerm);
      return matchesSearch && user.isActive === filterActive;
    });
  }, [users, lowerCaseSearchTerm, filterActive]);

  // Sort users by user_id.
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => a.user_id - b.user_id);
  }, [filteredUsers]);

  // Memoize headers.
  const headers = useMemo(
    () => [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Address",
      "DOB",
      "Active",
      "ACTION",
    ],
    []
  );

  // Format DOB as "Jan. 1, 1990"
  const formatDOB = (dob) => {
    return new Date(dob)
      .toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      .replace(/^(\w{3}) /, "$1. ");
  };

  const handleCloseEmailModal = () => {
    setOpenEmailModal(false);
  };

  return (
    <Container maxWidth="xl" sx={{ p: { xs: 2, sm: 3 } }}>
      {usersLoading ? (
        <HarvestSkeliton />
      ) : (
        <Paper
          sx={{
            width: "100%",
            overflow: "hidden",
            borderRadius: "10px",
            boxShadow: 15,
            p: { xs: 1, sm: 2, md: 3 },
            mb: { xs: 3, sm: 5 },
            mt: { xs: 2, sm: 3 },
          }}
        >
          {/* Top Controls */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              mb: { xs: 2, sm: 3 },
              gap: 2,
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "1rem", sm: "1.3rem", md: "1.5rem" },
              }}
            >
              USER MANAGEMENT{" "}
              <Typography
                component="span"
                sx={{
                  fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                  color: filterActive ? "green" : "red",
                }}
              >
                {filterActive
                  ? "(Activated Accounts)"
                  : "(Deactivated Accounts)"}
              </Typography>
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                gap: { xs: 1, sm: 2 },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <Button
                variant="contained"
                startIcon={<EmailIcon sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }} />}
                onClick={() => setOpenEmailModal(true)}
                sx={{
                  backgroundColor: "#06402B",
                  "&:hover": { backgroundColor: "#06402B" },
                  fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                  textTransform: "none",
                  px: { xs: 1, sm: 2 },
                }}
              >
                Send Email
              </Button>
              <TextField
                label="Search Users"
                variant="outlined"
                size="small"
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: { xs: "100%", sm: "300px" },
                  "& .MuiInputBase-root": {
                    fontSize: { xs: "0.75rem", sm: "0.9rem" },
                  },
                }}
              />
            </Box>
          </Box>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 650, backgroundColor: "#fff" }}>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "#06402B",
                    borderRadius: "10px",
                  }}
                >
                  {headers.map((header) => (
                    <TableCell
                      key={header}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        color: "#fff",
                        fontSize: { xs: "0.7rem", sm: "0.9rem", md: "1.1rem" },
                      }}
                    >
                      {header === "Active" ? (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography component="span">Active</Typography>
                          <IconButton
                            size="small"
                            onClick={() => setFilterActive((prev) => !prev)}
                            sx={{ color: "#fff" }}
                          >
                            <ArrowDropDownIcon sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }} />
                          </IconButton>
                        </Box>
                      ) : (
                        header
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedUsers
                  .slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                  .map((user) => (
                    <UserRow
                      key={user.user_id}
                      user={user}
                      formatDOB={formatDOB}
                      onToggleUserStatus={handleToggleUserStatus}
                    />
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: { xs: 2, sm: 3 },
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

      {/* Email Modal */}
      <SendEmailModal open={openEmailModal} onClose={handleCloseEmailModal} />

      {/* Verification Modal */}
      <VerificationModal
        open={openVerificationModal}
        onClose={() => setOpenVerificationModal(false)}
        onVerify={handleVerification}
        selectedUser={selectedUser}
      />
    </Container>
  );
}

export default UserManagement;
