import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";

// 🔐 Always send cookies
axios.defaults.withCredentials = true;

interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔑 Check auth on app load (cookie → backend)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8001/api/auth/me"
        );

        console.log("✅ Auth restored from cookie:", res.data);
        setUser(res.data);
        setIsLoggedIn(true);
      } catch (error: any) {
        console.log("❌ Not authenticated:", error.response?.status, error.message);
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 🔐 Login → backend sets cookie
  const login = async (email: string, password: string) => {
    const res = await axios.post(
      "http://localhost:8001/api/auth/login",
      { email, password }
    );

    // After login, fetch user from cookie
    setUser(res.data.user);
    setIsLoggedIn(true);
    console.log("✅ Login successful (cookie set)");
  };

  // 🚪 Logout → clear cookie
  const logout = async () => {
    await axios.post("http://localhost:8001/api/auth/logout");

    setUser(null);
    setIsLoggedIn(false);
    console.log("✅ Logged out");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
