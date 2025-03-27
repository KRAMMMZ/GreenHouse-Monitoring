import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  // On app load, check if the user is authenticated using the HTTP-only cookie. 
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:3001/admin/me", {
          withCredentials: true,
        });
        if (response.data.success) {
          setUser(response.data.user_data);
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setUser(null);
        setIsLoggedIn(false);
      }
      setAuthLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Show a loading alert (no timer) before making the request
      Swal.fire({
        title: "Please wait...",
        text: "Loading...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
  
      const response = await axios.post(
        "http://localhost:3001/admin/login",
        { email, password },
        { withCredentials: true }
      );
  
      // Close the loading alert once the request is done
      Swal.close();
  
      if (response.data.success) {
        // On success, store user info, redirect, etc.
        setUser(response.data.user_data);
        setIsLoggedIn(true);
        Swal.fire("Success", "Login Successful!", "success");
        navigate("/dashboard");
      } else {
        // If the response indicates failure, throw an error
        throw new Error(response.data.message || "Authentication failed");
      }
    } catch (error) {
      // Ensure the loading alert is closed
      Swal.close();
  
      // Get the original error message
      const errorMessage =
        error.response?.data?.message || error.message || "Something went wrong.";
  
      // If error message is "Email doesn't exist.", change it to "Invalid Credentials"
      const displayErrorMessage =
        errorMessage === "Email doesn't exist." ? "Invalid Credentials" : errorMessage;
  
      // Show an error alert with the EXACT message (modified if necessary)
      Swal.fire("Error", displayErrorMessage, "error");
  
      console.error("Login Error:", error);
    }
  };
  

  const logout = async () => {
    try {
      
      Swal.fire({
        title: "Please wait...",
        text: "Loading...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post(
        "http://localhost:3001/admin/logout",
        { email: user?.email },
        { withCredentials: true }
      );
      if (response.data.success) {
        setUser(null);
        setIsLoggedIn(false); 
        Swal.fire("Success", "Logged Out Successfully!", "success");
        navigate("/");
      } else {
        throw new Error(response.data.message || "Logout failed");
      }
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Logout failed",
        "error"
      );
      console.error("Logout Error:", error);
    }
  };

  const value = {
    user,
    isLoggedIn,
    authLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!authLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
