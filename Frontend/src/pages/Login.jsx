import React, { useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Link,
  Container,
  Box,
} from "@mui/material";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import { useAuth } from "../contexts/AuthContext";
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

    if (!username) newErrors.username = "*Email is required";
    if (!password) newErrors.password = "*Password is required";

    if (newErrors.username || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    // Call login; the loading alert will be shown inside the login function.
    await login(username, password);
  };

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();

    Swal.fire({
      title: "Please wait...",
      text: "Loading...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      timer: 300,
      didOpen: () => {
        Swal.showLoading();
      },
    }).then(() => {
      setOpenForgotPassword(true);
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
    // This wrapping div uses your "login" class with the background overlay
    <div className="login">
      <Container maxWidth="xs">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          {!openForgotPassword && (
            <Card
              className="card rad"
              sx={{
                width: { xs: "90%", sm: "400px" },
                boxShadow: 3,
                padding: 2,
                position: "relative", // ensures card is above the background pseudo-element
                zIndex: 1,
              }}
            >
              <CardContent>
                <Box textAlign="center" mb={2}>
                  <img
                    src="./src/assets/N_AGREEMO.png"
                    alt="Logo"
                    className="logo"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                    }}
                  />
                </Box>
                <form onSubmit={handleFormSubmit}>
                  <Box mb={2}>
                    <label className="mb-1">Email: </label>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={username}
                      onChange={(e) => handleInputChange(e, "username")}
                      placeholder="Enter your email"
                      error={!!errors.username}
                      helperText={errors.username}
                      autoComplete="off"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Box
                              component="span"
                              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" }, mr:1  }}
                            >
                              <FaUser />
                            </Box>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
                          borderColor: "red",
                        },
                        "& input": {
                          backgroundColor: "white !important",
                        },
                      }}
                    />
                  </Box>
                  <Box mb={3}>
                    <label className="mb-1">Password: </label>
                    <TextField
                      fullWidth
                      type={showPassword ? "text" : "password"}
                      variant="outlined"
                      value={password}
                      onChange={(e) => handleInputChange(e, "password")}
                      placeholder="Enter your password"
                      error={!!errors.password}
                      helperText={errors.password}
                      autoComplete="off"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Box
                              component="span"
                              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" }, mr:1 }}
                            >
                              <FaLock />
                            </Box>
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleClickShowPassword}
                              edge="end"
                              aria-label="toggle password visibility"
                            >
                              <Box
                                component="span"
                                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                              >
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                              </Box>
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
                          borderColor: "red",
                        },
                        "& input": {
                          backgroundColor: "white !important",
                        },
                      }}
                    />
                  </Box>
                  <Box display="flex" justifyContent="flex-end" mb={3}>
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      color="primary"
                      onClick={handleForgotPasswordClick}
                      sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}
                    >
                      Forgot your password?
                    </Link>
                  </Box>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{
                      padding: { xs: "10px", sm: "15px" },
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                    }}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
          <ForgotPasswordModal
            open={openForgotPassword}
            onClose={() => setOpenForgotPassword(false)}
          />
        </Box>
      </Container>
    </div>
  );
}

export default Login;
