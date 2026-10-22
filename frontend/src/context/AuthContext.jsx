import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, loginUser, logoutUser } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authUnavailable, setAuthUnavailable] = useState(false);

  const checkAuth = async ({ showLoading = true } = {}) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const response = await getCurrentUser();

      setAuthUnavailable(false);
      if (response.success) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      const status = error.response?.status;

      if (status === 401 || status === 403) {
        //The server rejected the session.
        setUser(null);
      } else {
        //Network failure or server unavailable.
        //Don't automatically clear the current user.
        setAuthUnavailable(true);
        console.error("Authentication check failed:", error);
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let isMounted = true;

    const initiazeAuth = async () => {
      try {
        const response = await getCurrentUser();

        if (!isMounted) return;

        setAuthUnavailable(false);

        if (response.success) {
          setUser(response.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        if (!isMounted) return;

        const status = error.response?.status;

        if (status === 401 || status === 403) {
          setUser(null);
        } else {
          setAuthUnavailable(true);
          console.error("Authentication check failed:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    initiazeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const response = await loginUser({ email, password });

    if (response.success) {
      setUser(response.user);
      setAuthUnavailable(false);
    }
    return response;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setAuthUnavailable(false);
    }
  };

  const value = {
    user,
    loading,
    authUnavailable,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
