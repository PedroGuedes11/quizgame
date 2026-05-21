// Form validation utilities
export class ValidationUtils {
    static isValidEmail(email) {
        if (typeof email !== 'string') {
            return false;
        }

        const trimmedEmail = email.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(trimmedEmail);
    }

    static isValidPassword(password) {
        if (typeof password !== 'string') {
            return false;
        }

        const trimmedPassword = password.trim();
        const hasMinLength = trimmedPassword.length >= 6;
        const hasLetter = /[A-Za-z]/.test(trimmedPassword);
        const hasNumber = /[0-9]/.test(trimmedPassword);
        const hasNoSpaces = !/\s/.test(trimmedPassword);

        return hasMinLength && hasLetter && hasNumber && hasNoSpaces;
    }

    static isValidUsername(username) {
        if (typeof username !== 'string') {
            return false;
        }

        const trimmedUsername = username.trim();
        return trimmedUsername.length >= 3 && trimmedUsername.length <= 100;
    }

    static showError(selector, message) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    }

    static hideError(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.style.display = 'none';
        }
    }
}