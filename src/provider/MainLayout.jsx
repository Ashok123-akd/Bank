import { Outlet, NavLink, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "./authContext";
import "./MainLayout.css";

export default function MainLayout() {
    const { isAuthenticated, loading, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    if (loading) return <div>Loading...</div>;

    const handlelogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return (
        <div className="main-shell">
            <header className="main-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                        src="/logo.png"
                        alt="Bank logo"
                        width={52}
                        height={52}
                        style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 6px 18px rgba(43,31,24,0.12)' }}
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/fallback-logo.svg'; }}
                    />
                    <div>
                        <h1 style={{ margin: 0, fontSize: 20 }}>Bank of Kathmandu</h1>
                        <div style={{ fontSize: 12, color: '#6b584d' }}>Secure wallet demo</div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handlelogout}
                    style={{ backgroundColor: "#E65100", color: "white", padding: "10px 20px", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                    Logout
                </button>
            </header>

            <nav className="main-nav">
                <div className="nav-inner">
                    <NavLink to="/app" end className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/app/withdraw" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
                        Withdraw
                    </NavLink>
                    <NavLink to="/app/deposit" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
                        Deposit
                    </NavLink>
                    <NavLink to="/app/audit" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
                        Audit
                    </NavLink>
                    <NavLink to="/app/profile" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
                        Profile
                    </NavLink>
                </div>
            </nav>

            <main className="main-content">
                <Outlet />
            </main>

            <footer className="main-footer">
                <p>Bank of Kathmandu - Demo App</p>
            </footer>
        </div>
    );
}
