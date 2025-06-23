import { data } from "autoprefixer";
import axios from "axios";
import apiClient from './apiClient';  


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
        const response = await apiClient.post(`${AUTH_URL}register/`, {
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
        const response = await apiClient.post(`${AUTH_URL}login/`, {
            username,
            password
        });

        const { access, refresh } = response.data;

        if (!access || !refresh) {
            throw new Error("Invalid response: Tokens missing.");
        }

        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);

        return response.data;
    } catch (error) {
        console.error('Login error:', error.response ? error.response.data : error.message);
        throw new Error(error.response?.data?.detail || "Login failed!");
    }
};

export const logoutUser = async () => {
    try {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
            throw new Error('No refresh token found. User may already be logged out.');
        }

        const response = await apiClient.post(`${AUTH_URL}logout/`, { refresh: refreshToken });

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
        const response = await apiClient.get('profiles/my_profile/');
        return response.data;
    } catch (e) {
        console.error(e);
        throw new Error("Getting user info failed!");
    }
};

export const refreshToken = async () => {
    try {
        const refresh = localStorage.getItem("refresh_token");
        const response = await apiClient.post(`${AUTH_URL}refresh/`, {
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
