 
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js"; // Import your Firebase config
import Swal from "sweetalert2"; // Import SweetAlert2

export const handleLogin = async (username, password, setUsernameError, setPasswordError, navigate, setPassword) => {
  let hasError = false;

  // Validate email
  if (!username) {
    setUsernameError("Please enter your email.");
    hasError = true;
  } else {
    setUsernameError(""); // Clear error if valid
  }

  // Validate password
  if (!password) {
    setPasswordError("Please enter your password.");
    hasError = true;
  } else {
    setPasswordError(""); // Clear error if valid
  } 

  if (hasError) {
    return; // Stop submission if there are errors
  }

  try {
    // Attempt to log in with Firebase Auth
    await signInWithEmailAndPassword(auth, username, password);
    Swal.fire({
      icon: "success",
      title: "Login Successful",
      text: "Welcome back!",
    });
    navigate("/dashboard"); // Redirect to the dashboard
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Invalid Credentials",
      text: "Please check your email and password.",
    });
       // Clear password field when login fails
       setPassword(""); // Reset the password state
       setPasswordError(""); // Clear any password error message
    console.error("Login Error:", error.message);
  }
};
