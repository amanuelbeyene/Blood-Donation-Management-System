/**
 * Validates a password against strict security requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special symbol (!@#$%^&*(),.?":{}|<>)
 * 
 * @param password The password string to validate
 * @returns { isValid: boolean; message: string }
 */
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }

    const hasCapital = /[A-Z]/.test(password);
    const hasSmall = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasCapital || !hasSmall || !hasNumber || !hasSymbol) {
        return {
            isValid: false,
            message: 'Password must include at least one Capital Letter, Small Letter, Number, and Symbol'
        };
    }

    return { isValid: true, message: 'Password is valid' };
};
