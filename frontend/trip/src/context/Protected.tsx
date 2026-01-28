import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Outlet } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;

  return children;
}
