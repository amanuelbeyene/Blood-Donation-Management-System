import { useContext } from 'react';
// But wait, AuthContext is not exported as default or named from '../contexts/AuthContext'?
// In AuthContext.tsx: export const AuthProvider = ...; export const useAuth = ... (Wait, there is ALREADY a useAuth in AuthContext.tsx)

// Conflict! src/contexts/AuthContext.tsx exports `useAuth` vs src/hooks/useAuth.ts exports `useAuth`.
// We should use the one from Context.

// However, ProtectedRoute imports from THIS file (hooks/useAuth).
// So this file should just re-export or wrap the Context one.

import { useAuth as useContextAuth } from '../contexts/AuthContext';

export const useAuth = () => {
    const { user, isAuthenticated, logout } = useContextAuth();

    return {
        isAuthenticated,
        user: user ? {
            role: user.role,
            userId: user.id,
            name: user.name,
            profilePicture: user.profilePicture
        } : null,
        isLoading: false,
        logout,
    };
};
