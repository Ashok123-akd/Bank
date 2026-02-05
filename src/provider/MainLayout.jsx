import { Outlet, NavLink, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContextProvider";

export default function MainLayout() {
    const { isAuthenticated, loading, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    if (loading) return <div>Loading...</div>;

    const linkStyle = ({ isActive }) => ({
        color: isActive ? "var(--accent)" : "var(--ink-700)",
        fontWeight: isActive ? "700" : "500",
        textDecoration: "none",
    });

    const handlelogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return (
        <div>
            <header
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 20px",
                    borderBottom: "2px solid rgba(43,31,24,0.06)",
                    background: "linear-gradient(90deg, rgba(255,250,242,1) 0%, rgba(255,248,236,1) 100%)",
                }}
            >
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

                {/* Top header only shows brand and logout. Primary navigation lives inside the Home page */}

                <button
                    type="button"
                    onClick={handlelogout}
                    style={{ backgroundColor: "#E65100", color: "white", padding: "10px 20px", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                    Logout
                </button>
            </header>

            <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
                <Outlet />
            </main>

            <footer
                style={{
                    textAlign: "center",
                    padding: "20px",
                    borderTop: "1px solid rgba(43,31,24,0.06)",
                    color: "var(--ink-300)",
                }}
            >
                <p>Bank of Kathmandu - Demo App</p>
            </footer>
        </div>
    );
}
