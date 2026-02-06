import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    role: 'donor' | 'hospital' | 'admin' | 'super_admin' | 'staff' | 'medical_staff';
    profilePicture?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Helper to determine role from path for initial load
    const getRoleFromPath = (path: string): string => {
        if (path.startsWith('/super-admin')) return 'super_admin';
        if (path.startsWith('/admin')) return 'admin';
        if (path.startsWith('/staff')) return 'staff';
        if (path.startsWith('/medical-staff')) return 'medical_staff';
        if (path.startsWith('/hospital')) return 'hospital';
        // Donor routes are numerous, so we treat it as default or checking specific prefixes
        if (path.startsWith('/donor-dashboard') || path.startsWith('/donors') || path.startsWith('/history') || path.startsWith('/requests') || path.startsWith('/inventory')) return 'donor';
        return 'donor'; // Default callback
    };

    const [user, setUser] = useState<User | null>(() => {
        try {
            // Try to find a user based on current path context
            const role = getRoleFromPath(window.location.pathname);

            // 1. Try sessionStorage (Active Tab Session)
            const sessionUser = sessionStorage.getItem(`user_${role}`);
            if (sessionUser) {
                return JSON.parse(sessionUser);
            }

            // 2. Fallback to localStorage (Last Active Session) - for "Open in New Tab"
            let localUser = localStorage.getItem(`user_${role}`);
            let localToken = localStorage.getItem(`token_${role}`);

            // Fallback for legacy key casing (e.g. user_Admin vs user_admin)
            if (!localUser) {
                const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1); // e.g. admin -> Admin
                const legacyUser = localStorage.getItem(`user_${capitalizedRole}`);
                if (legacyUser) {
                    localUser = legacyUser;
                    // Try to find legacy token as well
                    const legacyToken = localStorage.getItem(`token_${capitalizedRole}`);
                    if (legacyToken) localToken = legacyToken;

                    // Migrate to correct keys
                    localStorage.setItem(`user_${role}`, legacyUser);
                    if (localToken) localStorage.setItem(`token_${role}`, localToken);
                }
            }

            if (localUser) {
                const parsedUser = JSON.parse(localUser);

                // CRITICAL FIX: Ensure role is lowercase to match ProtectedRoute expectations
                if (parsedUser.role && parsedUser.role !== parsedUser.role.toLowerCase()) {
                    parsedUser.role = parsedUser.role.toLowerCase();
                    // Update the stored value with the normalized one to fix it permanently
                    localStorage.setItem(`user_${role}`, JSON.stringify(parsedUser));
                }

                // Hydrate sessionStorage so this tab becomes independent from now on
                // Use the potentially normalized parsedUser
                sessionStorage.setItem(`user_${role}`, JSON.stringify(parsedUser));

                // ALSO hydrate the token if it exists
                if (localToken) {
                    sessionStorage.setItem(`token_${role}`, localToken);
                }

                return parsedUser;
            }

            return null;
        } catch (error) {
            console.error('Failed to parse user from storage', error);
            return null;
        }
    });

    const login = (userData: User) => {
        setUser(userData);
        // Save to BOTH to support "Refresh" (Session) and "New Tab" (Local)
        const userStr = JSON.stringify(userData);
        sessionStorage.setItem(`user_${userData.role}`, userStr);
        localStorage.setItem(`user_${userData.role}`, userStr);
    };

    const logout = () => {
        if (user && user.role) {
            sessionStorage.removeItem(`user_${user.role}`);
            sessionStorage.removeItem(`token_${user.role}`);

            // Optional: Do we clear localStorage? 
            // Yes, explicit logout should probably clear the "Last Active" state too.
            localStorage.removeItem(`user_${user.role}`);
            localStorage.removeItem(`token_${user.role}`);
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
