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

  // Check for existing session on app load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
    setAuthLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
        const response = await axios.post("http://localhost:3001/admin/login", {
            email,
            password,
        });

        if (response.data.success) {
            const  storedData = response.data.user_data; // Extract email and name
            const userData = storedData;

            setUser(userData);
            setIsLoggedIn(true);
            localStorage.setItem("user", JSON.stringify(userData)); // Store user data

            Swal.fire("Success", "Login Successful!", "success");
            navigate("/dashboard");
        } else {
            throw new Error(response.data.message || "Authentication failed");
        }
    } catch (error) {
        Swal.fire("Error", "Invalid Credentials", "error");
        console.error("Login Error:", error);
    }
};



 
  // Logout function
  const logout = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const email = storedUser.email;
    console.log(email);
    try{
      const response = await axios.post("http://localhost:3001/admin/logout", {
        email,
      });
  
      if (response.data.success) {
        localStorage.removeItem("user"); // Clear user data from localStorage
        setUser(null);
        setIsLoggedIn(false);
        Swal.fire("Success", "Logged Out Successfully!", "success");
        navigate("/");
      } else {
        throw new Error(response.data.message || "Authentication failed");
      }
    } catch (error) {
      Swal.fire("Error", "Invalid Credentials", "error");
      console.error("Login Error:", error);
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