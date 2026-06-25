import { createContext, useContext, useEffect, useState } from "react";

import { tokenService } from "./tokenService";
import { refreshAccessToken } from "./refreshService";

export interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const login = (token: string, userData: User) => {
    tokenService.setToken(token);
    setUser(userData);
  };

  const logout = () => {
    tokenService.clearToken();
    setUser(null);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await refreshAccessToken();

        if (response) {
          tokenService.setToken(response.accessToken);

          setUser(response.user);
        }
      } catch (err) {
        console.log("No session found");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthContextHook = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("AuthProvider missing");
  }

  return context;
};
