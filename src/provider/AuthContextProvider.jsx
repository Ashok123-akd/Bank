import { useState } from "react";
import { AuthContext } from "./authContext";

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

function generateAccountNumber() {
    return `AC${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 900 + 100)}`;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem("user");
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (err) {
            console.warn("Failed to load stored user", err);
            return null;
        }
    });
    const loading = false;

    const login = async (email, password) => {
        // First check registered users stored in localStorage (demo)
        try {
            const raw = localStorage.getItem('registered_users');
            if (raw) {
                const users = JSON.parse(raw);
                const found = users.find(u => u.email === email && u.password === password);
                if (found) {
                    setUser(found);
                    localStorage.setItem('user', JSON.stringify(found));
                    return found;
                }
            }
        } catch (err) {
            console.warn('login: failed to read registered_users', err);
        }

        // fallback to simulated authService
        const userData = await authService.login(email, password);

        // Ensure this user has a persistent registered profile with an accountNumber
        try {
            const raw = localStorage.getItem('registered_users');
            const list = raw ? JSON.parse(raw) : [];
            let found = list.find(u => u.email === userData.email);
            if (!found) {
                const profile = {
                    id: Date.now(),
                    firstName: userData.name?.split(' ')[0] || userData.name || 'User',
                    lastName: userData.name?.split(' ').slice(1).join(' ') || '',
                    email: userData.email,
                    password: password || '',
                    accountNumber: generateAccountNumber(),
                    createdAt: new Date().toISOString(),
                    role: userData.role || 'user',
                };
                list.push(profile);
                localStorage.setItem('registered_users', JSON.stringify(list));
                setUser(profile);
                localStorage.setItem('user', JSON.stringify(profile));
                return profile;
            }
            // if found but missing accountNumber, ensure it exists
            if (!found.accountNumber) {
                found.accountNumber = generateAccountNumber();
                localStorage.setItem('registered_users', JSON.stringify(list));
            }
            setUser(found);
            localStorage.setItem('user', JSON.stringify(found));
            return found;
        } catch (err) {
            console.warn('login: failed to persist authService user', err);
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            return userData;
        }
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
