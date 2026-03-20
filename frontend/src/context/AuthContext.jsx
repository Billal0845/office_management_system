import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export const AuthContext = createContext();

// Add this custom hook so any component can easily use: const { user } = useAuth();
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in when the app loads
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);

    // Redirect based on role
    if (userData.role === "super_admin") navigate("/admin");
    else if (userData.role === "manager") navigate("/manager");
    else if (userData.role === "employee") navigate("/employee");
  };

  const logout = async () => {
    try {
      await axios.post("/logout"); // Call your Laravel logout API
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
