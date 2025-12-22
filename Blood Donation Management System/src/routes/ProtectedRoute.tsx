import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../store/slices/authSlice';

interface ProtectedRouteProps {
    children: ReactNode;
    roles?: UserRole[];
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div>Loading...</div>; // Or a spinner
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If specific roles are required and user doesn't have them
    if (roles && user && !roles.includes(user.role)) {
        // Redirect to unauthorized or home
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
