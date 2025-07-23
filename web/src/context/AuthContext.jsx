import toast from "react-hot-toast";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { AuthContext } from "./useAuth";
import { decodeJWT, isTokenExpired } from "../utils/jwt";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = sessionStorage.getItem("jwt_token");
    if (savedToken) {
      if (!isTokenExpired(savedToken)) {
        const decoded = decodeJWT(savedToken);
        if (decoded) {
          setToken(savedToken);
          setUser({ id: decoded.id, role: decoded.role });
        } else {
          sessionStorage.removeItem("jwt_token");
        }
      } else {
        sessionStorage.removeItem("jwt_token");
        toast.error("Session expired. Please login again.");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (userId) => {
    const loadingToast = toast.loading("Signing in...");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: userId }),
        }
      );

      if (!response.ok) {
        toast.dismiss(loadingToast);
        toast.error("Login failed. Please check your credentials.");
        throw new Error("Login failed");
      }

      const data = await response.json();
      const decoded = decodeJWT(data.token);

      if (!decoded) {
        toast.dismiss(loadingToast);
        toast.error("Invalid token received");
        throw new Error("Invalid token");
      }

      setToken(data.token);
      setUser({ id: decoded.id, role: decoded.role });
      sessionStorage.setItem("jwt_token", data.token);

      toast.dismiss(loadingToast);
      toast.success(`Welcome back, ${decoded.id}!`);
      return { success: true };
    } catch (error) {
      toast.dismiss(loadingToast);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem("jwt_token");
    toast.success("Logged out successfully");
  };

  const value = {
    token,
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
