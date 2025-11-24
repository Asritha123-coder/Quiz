import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        // Determine role - admin if email contains "admin" or specific admin emails
        const role = userData.email?.toLowerCase().includes("admin") || 
                    userData.role === "admin" ? "admin" : "user";
        setUserRole(role);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.get("http://localhost:3000/users");
      const users = response.data || [];
      const foundUser = users.find(
        (u) => u.email === email && (u.password === password || !u.password)
      );

      if (foundUser) {
        const userData = {
          ...foundUser,
          role: foundUser.role || (email.toLowerCase().includes("admin") ? "admin" : "user"),
        };
        setUser(userData);
        setIsAuthenticated(true);
        setUserRole(userData.role);
        localStorage.setItem("user", JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        return { success: false, error: "Invalid email or password" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed. Please try again." };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const role = email.toLowerCase().includes("admin") ? "admin" : "user";
      const userData = {
        name,
        email,
        password,
        role,
      };

      // Save to db.json
      await axios.post("http://localhost:3000/users", userData);

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      setUserRole(role);

      return { success: true, user: userData };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: "Signup failed. Please try again." };
    }
  };

  const googleLogin = async (userInfo) => {
    try {
      const role = userInfo.email?.toLowerCase().includes("admin") ? "admin" : "user";
      const userData = {
        name: userInfo.name,
        email: userInfo.email,
        googleId: userInfo.sub,
        password: "",
        role,
      };

      // Check if user exists
      const response = await axios.get("http://localhost:3000/users");
      const users = response.data || [];
      const existingUser = users.find((u) => u.email === userInfo.email);

      if (!existingUser) {
        await axios.post("http://localhost:3000/users", userData);
      } else {
        // Update role if needed
        if (existingUser.role !== role) {
          await axios.patch(`http://localhost:3000/users/${existingUser.id}`, { role });
          userData.role = role;
        }
      }

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      setUserRole(role);

      return { success: true, user: userData };
    } catch (error) {
      console.error("Google login error:", error);
      return { success: false, error: "Google login failed. Please try again." };
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    setUserRole(null);
  };

  const value = {
    isAuthenticated,
    user,
    userRole,
    loading,
    login,
    signup,
    googleLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


