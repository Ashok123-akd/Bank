import { Outlet, NavLink,useNavigate, useLocation, Navigate } from "react-router";
import { useAuth } from "./AuthContextProvider";
export default function MainLayout() {
    const { isAuthenticated, loading, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    if (loading) return <div>Loading...</div>;

    const linkStyle = ({ isActive }) => ({
        color: isActive ? "#2196f3" : "#333",
        fontWeight: isActive ? "bold" : "normal",
        textDecoration: "none",
    });
    const handlelogout = () => {
        logout();
        navigate("/login",{ replace: true });
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
                    padding: "16px 24px",
                    borderBottom: "2px solid #eee",
                }}
            >
                <h1 style={{ margin: 0 }}>Bank Application</h1>
                <nav style={{ display: "flex", gap: "20px" }}>
                    <NavLink to="/" style={linkStyle} end>
                        Home
                    </NavLink>
                    <NavLink to="/blog" style={linkStyle}>
                        Widthdraw
                    </NavLink>
                    <NavLink to="/about" style={linkStyle}>
                        Deposit
                    </NavLink>
                </nav>
                <button
                type="button"
                onClick={handlelogout}
                style={{ backgroundColor: "#f44336", color: "white", padding: "10px 20px", border: "none", borderRadius: "4px", cursor: "pointer" 
                }}
                >Logout</button>
            </header>

            <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
                {/* Child routes render here */}
                <Outlet />
            </main>

            <footer
                style={{
                    textAlign: "center",
                    padding: "20px",
                    borderTop: "1px solid #eee",
                    color: "#999",
                }}
            >
                <p>My Blog App - React Router Session</p>
            </footer>
        </div>
    );
}
