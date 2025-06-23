import { data } from "autoprefixer";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api/";
const AUTH_URL = `${API_BASE}auth/`;

// Store and retrieve token from localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem("access_token");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const registerUser = async (username, email, first_name, last_name, password, password_confirm) => {
    try {
        const response = await axios.post(`${AUTH_URL}register/`, {
            email,
            username,
            first_name,
            last_name,
            password,
            password_confirm
        });
        return response.data;
    } catch (e) {
        throw new Error("Registration failed!");
    }
};

export const loginUser = async (username, password) => {
    try {
        const response = await axios.post(`${AUTH_URL}login/`, {
            username,
            password
        });
        
        const { access, refresh } = response.data;

        if (!access || !refresh) {
            throw new Error("Invalid response: Tokens missing.");
        }

        // Store tokens
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);

        return response.data;
    } catch (error) {
        // Log actual error for debugging
        console.error('Login error:', error.response ? error.response.data : error.message);
        
        // You can throw a more detailed message or keep it generic for user display
        throw new Error(error.response?.data?.detail || "Login failed!");
    }
};

export const logoutUser = async () => {
    try {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (!accessToken || !refreshToken) {
            throw new Error('No tokens found. User may already be logged out.');
        }

        const response = await axios.post(
            'http://127.0.0.1:8000/api/auth/logout/',
            { refresh: refreshToken },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('Logout successful:', response.data.message);

        
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        return response.data;
    } catch (error) {
        console.error('Logout error:', error.response ? error.response.data : error.message);
        throw new Error(error.response?.data?.detail || 'Logout failed.');
    }
};

export const getUserInfo = async () => {
    try {
        const token = localStorage.getItem("access_token");
        if (!token) {
            throw new Error("No access token found");
        }
        console.log("Fetching user info with token:", token);
        const response = await fetch("http://127.0.0.1:8000/api/profiles/my_profile/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();
        console.log("User info response:", data);
        if (response.status !== 200) {
            throw new Error("Failed to fetch user info");
        }
        return data;
    } catch (e) {
        console.error(e); 
        throw new Error("Getting user info failed!");
    }
};

export const refreshToken = async () => {
    try {
        const refresh = localStorage.getItem("refresh_token");
        const response = await axios.post(`${AUTH_URL}refresh/`, {
            refresh
        });

        const { access } = response.data;
        localStorage.setItem("access_token", access);
        console.log("Token refreshed successfully");
        return access;
    } catch (e) {
        throw new Error("Refreshing token failed!");
    }
};
