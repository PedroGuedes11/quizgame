// API service for database requests
class ApiService {
    constructor() {
        this.baseUrl = window.location.origin; // Use relative URL for development
    }

    async request(endpoint, method = "GET", body = null) {
        const token = localStorage.getItem("token");
        const isFormData = body instanceof FormData;
        const headers = {};

        if (!isFormData && body != null) {
            headers["Content-Type"] = "application/json";
        }

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method,
                headers,
                body: isFormData ? body : body ? JSON.stringify(body) : null,
                cache: 'no-store',
            });

            const contentType = response.headers.get("content-type") || "";
            const isJson = contentType.includes("application/json");
            const responseBody = isJson ? await response.json() : null;

            if (!response.ok) {
                const errorMessage = responseBody?.error || responseBody?.message || response.statusText;
                if (response.status === 401) {
                    this.handleUnauthorized(errorMessage);
                }
                throw new Error(`HTTP ${response.status}: ${errorMessage}`);
            }

            return responseBody;
        } catch (error) {
            console.error("API request error:", error);
            throw error;
        }
    }

    handleUnauthorized(message) {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        console.warn('[ApiService] Unauthorized:', message);
        if (window.location.pathname !== '/html/register_login.html') {
            window.location.replace('/html/register_login.html');
        }
    }

    // Convenience methods
    async get(endpoint) {
        return this.request(endpoint, "GET");
    }

    async post(endpoint, body) {
        return this.request(endpoint, "POST", body);
    }

    async put(endpoint, body) {
        return this.request(endpoint, "PUT", body);
    }

    async delete(endpoint) {
        return this.request(endpoint, "DELETE");
    }
}

export const apiService = new ApiService();