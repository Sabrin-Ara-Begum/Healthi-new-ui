import { Navigate, Outlet } from "react-router";
import { useApp } from "../lib/AppContext";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useApp();
  const token = localStorage.getItem("token");

  // If there is no user in context and no token in localStorage, redirect to /auth
  if (!user && !token) {
    return <Navigate to="/auth" replace />;
  }

  // If children are provided, render them, otherwise render Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
}
