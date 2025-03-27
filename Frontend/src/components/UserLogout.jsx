import React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Typography from "@mui/material/Typography";
import { useAuth } from "../contexts/AuthContext";

export default function MenuPopupState({
  handleLogout,
  changePassModal,
  showProfileModal, // <--- NEW
}) {
  const { user } = useAuth(); // Access the user data from AuthContext

  return (
    <PopupState variant="popover" popupId="demo-popup-menu">
      {(popupState) => (
        <>
          <Button
            variant="text"
            {...bindTrigger(popupState)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              px: 1,
              py: 1,
              borderRadius: "16px",
              color: "#FFFFFF",
              textTransform: "none",
              width: "100%",
              "&:hover": {
                backgroundColor: "#2e6f40",
              },
            }}
          >
            <AccountCircleIcon
              sx={{
                fontSize: 25,
                color: "#FFFFFF",
                mr: 3,
              }}
            />
            <Typography
              sx={{
                fontSize: "1.2rem",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {user?.name || "Display the name here"}
            </Typography>
          </Button>

          <Menu
            {...bindMenu(popupState)}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
          >
            {/* NEW Profile menu item */}
            <MenuItem
              onClick={() => {
                popupState.close();
                showProfileModal(); // <--- Trigger the Profile modal
              }}
              sx={{
                "&:hover": {
                  backgroundColor: "#06402B",
                  color: "white",
                },
              }}
            >
              Profile
            </MenuItem>

            <MenuItem
              onClick={() => {
                popupState.close();
                changePassModal(); // Show change password modal
              }}
              sx={{
                "&:hover": {
                  backgroundColor: "#06402B",
                  color: "white",
                },
              }}
            >
              Change Password
            </MenuItem>

            <MenuItem
              onClick={async () => {
                popupState.close();
                await handleLogout(); // Call the logout function
              }}
              sx={{
                "&:hover": {
                  backgroundColor: "#06402B",
                  color: "white",
                },
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </>
      )}
    </PopupState>
  );
}
