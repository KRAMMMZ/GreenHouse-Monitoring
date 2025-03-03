import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  IconButton,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import axios from "axios";

const SendEmailModal = ({ open, onClose }) => {
  const [emailInput, setEmailInput] = useState("");
  const [emailList, setEmailList] = useState([]);
  const [errorText, setErrorText] = useState("");

  const handleAddEmail = () => {
    const trimmedEmail = emailInput.trim();
    // Simple regex to validate email format.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorText("Please enter a valid email address");
      return;
    }
    if (trimmedEmail !== "" && !emailList.includes(trimmedEmail)) {
      setEmailList([...emailList, trimmedEmail]);
      setEmailInput("");
      setErrorText("");
    }
  };

  const handleRemoveEmail = (emailToRemove) => {
    setEmailList(emailList.filter((email) => email !== emailToRemove));
  };

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

    const emailString = emailList.join(",");
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
        const results = response.data.results || [];
        const emailResults = {};
        results.forEach((result) => {
          const email = result.email;
          if (!emailResults[email]) {
            emailResults[email] = result;
          } else if (result.status === "success") {
            emailResults[email] = result;
          }
        });

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
        onClose();
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
    <Dialog
      open={open}
      onClose={(event, reason) => {
        // Prevent closing if clicking outside or pressing escape.
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        onClose();
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle
        sx={{
          fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
          px: { xs: 2, sm: 3 },
        }}
      >
        Send Email
      </DialogTitle>
      <DialogContent sx={{ py: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="Email"
            value={emailInput}
            placeholder="Enter email"
            onChange={(e) => {
              setEmailInput(e.target.value);
              if (errorText) setErrorText("");
            }}
            error={!!errorText}
            helperText={errorText}
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
              <Typography
                variant="body2"
                sx={{
                  mr: 1,
                  fontSize: { xs: "0.7rem", sm: "0.9rem", md: "1rem" },
                }}
              >
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
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontSize: { xs: "0.7rem", sm: "0.9rem", md: "1rem" },
          }}
        >
          CANCEL
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendEmailModal;
