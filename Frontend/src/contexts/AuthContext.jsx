import React, { createContext, useContext, useState } from "react";
import { auth } from "../firebase"; // Make sure your Firebase is configured
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

// Create the AuthContext
const AuthContext = createContext();

// AuthContext Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store logged-in user info
  const [loading, setLoading] = useState(false); // Track loading state for async actions
  const navigate = useNavigate();

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user); // Set the logged-in user
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome back!",
      });
      navigate("/dashboard"); // Navigate to Dashboard after login
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid email or password.",
      });
      console.error("Login Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null); // Clear user state
      Swal.fire({
        icon: "success",
        title: "Logged Out",
        text: "You have been logged out successfully.",
      });
      navigate("/"); // Navigate back to login
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Logout Failed",
        text: "Something went wrong. Please try again.",
      });
      console.error("Logout Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};