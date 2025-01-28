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
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext"; // Import AuthContext
import "../../public/login.css";

function Login() {
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await login(username, password);
  };

  // Determine if the button should be disabled
  const isButtonDisabled = !username || !password;

  return (
    <div className="login">
      <Card className="card rad">
        <CardContent>
          <div className="text-center mb-4">
            <img src="./src/assets/agreemo-symbol.png" alt="Logo" className="logo" />
            <Typography variant="h5">AGREEMO</Typography>
          </div>
          <form onSubmit={handleFormSubmit}>
            <label className="mb-1">Email: </label>
            <div className="mb-3">
              <TextField
                fullWidth
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your email"
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
              />
            </div>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isButtonDisabled || loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
