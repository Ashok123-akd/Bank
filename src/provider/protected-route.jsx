import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login, but save where the user was trying to go
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return children;
}