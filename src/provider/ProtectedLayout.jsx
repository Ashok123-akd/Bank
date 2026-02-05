
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContextProvider";

function ProtectedLayout() {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div>Loading...</div>;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return <Outlet />; // Renders child routes
}

export default ProtectedLayout;
