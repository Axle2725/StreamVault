import { Navigate } from "react-router-dom";

import { useAuth } from "../auth/useAuth";

export default function RequireRole({ role, children }: any) {
  const { user } = useAuth();

  if (user?.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
}
