import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);

  // ✅ si NO hay usuario → redirige
  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}