import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout as logoutAction } from '../store/slices/authSlice';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated, role, userId, fullName } = useAppSelector((state) => state.auth);

    const logout = () => {
        dispatch(logoutAction());
    };

    return {
        isAuthenticated,
        user: isAuthenticated ? { role, userId, name: fullName } : null,
        isLoading: false, // Mocking loading state for now
        logout,
    };
};
