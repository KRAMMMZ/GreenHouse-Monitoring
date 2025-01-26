import React, { useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Link } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../public/login.css";
import { useNavigate } from "react-router-dom";
import { handleLogin } from "../utils/LoginUtils.js"; // Import the handleLogin function

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (e.target.value) {
      setUsernameError(""); // Remove error message when typing
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (e.target.value) {
      setPasswordError(""); // Remove error message when typing
    }
  };

  return (
    <div className="login">
      <Card className="card rad">
        <CardContent>
          <div className="text-center mb-4">
            <img src="./src/assets/react.svg" alt="Logo" className="logo" />
            <Typography variant="h5">AGREEMO</Typography>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin(username, password, setUsernameError, setPasswordError, navigate, setPassword); // Pass setPassword
            }}
          >
            <label className="mb-1">Email: </label>
            <div className="mb-3">
              <TextField
                fullWidth
                variant="outlined"
                value={username}
                onChange={handleUsernameChange} // Call the change handler here
                placeholder="Enter your email"
                error={!!usernameError} // Highlight field if error exists
                helperText={usernameError} // Display error message
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaUser className="input-icon" />
                      </InputAdornment>
                    ),
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
                onChange={handlePasswordChange} // Call the change handler here
                error={!!passwordError} // Highlight field if error exists
                helperText={passwordError} // Display error message
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
                placeholder="Enter your password"
              />
            </div>

            <Button type="submit" variant="contained" color="primary" fullWidth>
              Login
            </Button>
            <div className="d-flex justify-content-end mt-2">
              <Link to="/" className="no-underline">
                Forgot Password?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
