import React, { useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Link,
} from "@mui/material";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2"; // Import SweetAlert
import { useAuth } from "../contexts/AuthContext"; // Import AuthContext
import ForgotPasswordModal from "../components/ForgotPassModal";
import "../../public/login.css";

function Login() {
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    let newErrors = { username: "", password: "" };

    // Validation logic
    if (!username) newErrors.username = "*Email is required";
    if (!password) newErrors.password = "*Password is required";

    if (newErrors.username || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    // If no errors, proceed with login
    await login(username, password);
  };

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();

    // Show SweetAlert Loading
    Swal.fire({
      title: "Please wait...",
      text: "Loading...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      timer: 300, // Show for 1 second
      didOpen: () => {
        Swal.showLoading();
      },
    }).then(() => {
      setOpenForgotPassword(true); // Open modal after SweetAlert disappears
    });
  };

  const handleInputChange = (e, field) => {
    const value = e.target.value;
    if (field === "username") {
      setUsername(value);
      setErrors((prevErrors) => ({
        ...prevErrors,
        username: value ? "" : prevErrors.username,
      }));
    } else if (field === "password") {
      setPassword(value);
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: value ? "" : prevErrors.password,
      }));
    }
  };

  return (
    <div className="login">
      <Card className="card rad">
        <CardContent>
          <div className="text-center mb-4">
            <img src="./src/assets/AGREEMO.png" alt="Logo" className="logo" />
            <Typography variant="h5">AGREEMO</Typography>
          </div>
          <form onSubmit={handleFormSubmit}>
            <label className="mb-1">Email: </label>
            <div className="mb-3">
              <TextField
                fullWidth
                variant="outlined"
                value={username}
                onChange={(e) => handleInputChange(e, "username")}
                placeholder="Enter your email"
                error={!!errors.username}
                helperText={errors.username}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaUser className="input-icon" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: "red",
                    },
                }}
              />
            </div>

            <label className="mb-1">Password: </label>
            <div className="mb-4">
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={password}
                onChange={(e) => handleInputChange(e, "password")}
                placeholder="Enter your password"
                error={!!errors.password}
                helperText={errors.password}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaLock className="input-icon" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          edge="end"
                          aria-label="toggle password visibility"
                        >
                          {showPassword ? <FaEye /> : <FaEyeSlash />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: "red",
                    },
                }}
              />
            </div>
            <div className="d-flex justify-content-end mt-2 mb-4">
              <Link
                component="button"
                type="button" // Add this line
                variant="body2"
                color="primary"
                onClick={handleForgotPasswordClick}
              >
                Forgot your password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ padding: 1.5 }}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <ForgotPasswordModal
        open={openForgotPassword}
        onClose={() => setOpenForgotPassword(false)}
      />
    </div>
  );
}

export default Login;
