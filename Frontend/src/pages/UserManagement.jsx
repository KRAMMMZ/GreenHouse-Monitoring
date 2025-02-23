// UserManagement.jsx
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import EmailIcon from "@mui/icons-material/Email";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import axios from "axios";

import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import useUserManagement from "../hooks/UserManagementHooks";
import UserRow from "../props/UserRow";

function UserManagement() {
  const { usersManage, usersLoading } = useUserManagement();
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState(true);
  const [users, setUsers] = useState([]);

  // Email Modal state
  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailList, setEmailList] = useState([]);

  // Sync local users state with hook data.
  useEffect(() => {
    setUsers(usersManage);
  }, [usersManage]);

  // Toggle user status with SweetAlert confirmation and API call.
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
          // Determine the backend endpoint based on current status.
          const endpoint = currentActive
            ? "http://localhost:3001/user/deactivate"
            : "http://localhost:3001/user/activate";

          axios
            .post(endpoint, { email: userEmail })
            .then((response) => {
              // Update local state if the request succeeds.
              setUsers((prevUsers) =>
                prevUsers.map((user) =>
                  user.user_id === user_id
                    ? { ...user, isActive: !user.isActive }
                    : user
                )
              );
              Swal.fire({
                title: currentActive ? "User deactivated!" : "User activated!",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            })
            .catch((error) => {
              Swal.fire({
                title: "Error",
                text: error.message,
                icon: "error",
                timer: 1500,
                showConfirmButton: false,
              });
            });
        }
      });
    },
    []
  );

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

  // Email Modal handlers
  const handleAddEmail = () => {
    const trimmedEmail = emailInput.trim();
    if (trimmedEmail !== "" && !emailList.includes(trimmedEmail)) {
      setEmailList([...emailList, trimmedEmail]);
      setEmailInput("");
    }
  };

  const handleRemoveEmail = (emailToRemove) => {
    setEmailList(emailList.filter((email) => email !== emailToRemove));
  };

  const handleCloseModal = () => {
    setOpenEmailModal(false);
  };

  // Function to send multiple emails via the backend and display organized feedback using a responsive table.
  const handleSendEmail = () => {
    if (emailList.length === 0) {
      Swal.fire({
        title: "No emails",
        text: "Please add at least one email",
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    // Join emails with a comma (no extra space)
    const emailString = emailList.join(",");

    // Show a loading alert to prevent multiple clicks.
    Swal.fire({
      title: "Sending emails...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    axios
      .post("http://localhost:3001/apk-link-sender", { email: emailString })
      .then((response) => {
        // Process the results from the response.
        const results = response.data.results || [];
        // Group results by email.
        const emailResults = {};
        results.forEach((result) => {
          const email = result.email;
          // If there's already a result for this email, prefer a "success" status over "already exists".
          if (!emailResults[email]) {
            emailResults[email] = result;
          } else if (result.status === "success") {
            emailResults[email] = result;
          }
        });

        // Build an HTML table with a style block for responsiveness.
        const htmlResults = `
          <style>
            .swal-results-table {
              width: 100%;
              max-width: 600px;
              border-collapse: collapse;
              text-align: center;
              margin: 0 auto;
            }
            .swal-results-table th, .swal-results-table td {
              border: 1px solid #ddd;
              padding: 16px;
              font-size: 1rem;
            }
            @media (max-width: 600px) {
              .swal-results-table th, .swal-results-table td {
                padding: 8px;
                font-size: 0.8rem;
              }
            }
          </style>
          <div style="display: flex; justify-content: center; width: 100%;">
            <table class="swal-results-table">
              <thead>
                <tr>
                  <th>EMAIL</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(emailResults)
                  .map(([email, resObj]) => {
                    let statusText = "";
                    if (resObj.status === "already exists") {
                      statusText = "Already exists";
                    } else if (resObj.status === "success") {
                      statusText = resObj.message || "Email sent successfully.";
                    } else if (resObj.status === "added") {
                      statusText = "Added successfully";
                    } else {
                      statusText = resObj.status;
                    }
                    return `<tr>
                      <td>${email}</td>
                      <td>${statusText}</td>
                    </tr>`;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>
        `;

        Swal.fire({
          title: "Email Send Results",
          html: htmlResults,
          icon: "info",
          confirmButtonText: "OK",
        });
        setEmailList([]);
        setOpenEmailModal(false);
      })
      .catch((error) => {
        Swal.fire({
          title: "Error",
          text: error.message,
          icon: "error",
          timer: 1500,
          showConfirmButton: false,
        });
      });
  };

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
            p: { xs: 1, sm: 2, md: 3 },
            mb: 5,
          }}
        >
          {/* Top Controls */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
              gap: 2,
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "1rem", sm: "1.5rem", md: "2rem" },
              }}
            >
              USER MANAGEMENT{" "}
              <Typography
                component="span"
                sx={{
                  fontSize: { xs: "0.8rem", sm: "1rem", md: "1.2rem" },
                  color: filterActive ? "green" : "red",
                }}
              >
                {filterActive
                  ? "(Activated Accounts)"
                  : "(Deactivated Accounts)"}
              </Typography>
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<EmailIcon />}
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
                      <SearchIcon />
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
          <TableContainer>
            <Table sx={{ minWidth: 650, backgroundColor: "#fff" }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#06402B", borderRadius: "10px" }}>
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
                            <ArrowDropDownIcon />
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
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
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

      {/* Email Modal */}
      <Dialog open={openEmailModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" }, px: { xs: 2, sm: 3 } }}>
          Send Email
        </DialogTitle>
        <DialogContent sx={{ py: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Email"
              value={emailInput}
              placeholder="Enter email"
              onChange={(e) => setEmailInput(e.target.value)}
              sx={{
                "& .MuiInputBase-root": {
                  fontSize: { xs: "0.7rem", sm: "0.9rem", md: "1rem" },
                },
              }}
            />
            <IconButton
              onClick={handleAddEmail}
              sx={{
                ml: 1,
                backgroundColor: "#2e6f40",
                padding: 1,
                "&:hover": {
                  backgroundColor: "#06402B",
                  "& .MuiSvgIcon-root": { color: "#000" },
                },
              }}
            >
              <AddIcon fontSize="medium" sx={{ color: "#fff" }} />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {emailList.map((email) => (
              <Box
                key={email}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "#2e6f40",
                  p: 1,
                  borderRadius: 1,
                  color: "#fff",
                }}
              >
                <Typography variant="body2" sx={{ mr: 1, fontSize: { xs: "0.7rem", sm: "0.9rem", md: "1rem" } }}>
                  {email}
                </Typography>
                <IconButton onClick={() => handleRemoveEmail(email)} size="small">
                  <CloseIcon fontSize="small" sx={{ color: "#fff" }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 1, sm: 2 } }}>
          <Button
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: "#06402B",
              "&:hover": { backgroundColor: "#06402B" },
              textTransform: "none",
              fontSize: { xs: "0.7rem", sm: "0.9rem", md: "1rem" },
            }}
            onClick={handleSendEmail}
          >
            SEND TO EMAIL
          </Button>
          <Button
            variant="outlined"
            onClick={handleCloseModal}
            sx={{
              textTransform: "none",
              fontSize: { xs: "0.7rem", sm: "0.9rem", md: "1rem" },
            }}
          >
            CANCEL
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default UserManagement;
