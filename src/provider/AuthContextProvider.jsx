import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(undefined);

// Simulated auth service (replace with real API in production)
const authService = {
    login: async (email, password) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (email === "admin@test.com" && password === "password") {
            return { id: 1, name: "Admin User", email, role: "admin" };
        }
        if (email === "user@test.com" && password === "password") {
            return { id: 2, name: "Regular User", email, role: "user" };
        }
        throw new Error("Invalid email or password");
    },
    logout: async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
    },
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for stored session on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const userData = await authService.login(email, password);
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        return userData;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        localStorage.removeItem("user");
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        loading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}   