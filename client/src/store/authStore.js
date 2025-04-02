import axios from "axios";
import { create } from "zustand";
import { showErrorToast, showSuccessToast } from "../pages/toastUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem("cnnct_user")) || null,
    isSigningUp: false,
    isCheckingAuth: true,
    isLoggingIn: false,
    isLoggingOut: false,

    signupData: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        username: "",
        category: "",
    },

    setSignupData: (data) => {
        set((state) => ({
            signupData: { ...state.signupData, ...data }, 
        }));
    },

    signup: async (credentials) => {
        set({ isSigningUp: true });
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, credentials, { withCredentials: true });
            set({ user: res.data.user, isSigningUp: false });
            localStorage.setItem("cnnct_user", JSON.stringify(res.data.user));
            showSuccessToast("Account created successfully!!");
        } catch (error) {
            showErrorToast(error.response?.data?.message || "SignUp failed");
            set({ isSigningUp: false, user: null });
        }
    },

    login: async (credentials) => {
        set({ isLoggingIn: true });
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials, { withCredentials: true });
            set({ isLoggingIn: false, user: res.data.user });
            localStorage.setItem("cnnct_user", JSON.stringify(res.data.user));
            showSuccessToast("Login successful!!");
            return true;
        } catch (error) {
            set({ isLoggingIn: false, user: null });
            throw error;
        }
    },

    logout: async () => {
        set({ isLoggingOut: true });
        try {
            await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
            set({ isLoggingOut: false, user: null, signupData: {} });
            localStorage.removeItem("cnnct_user");
            showSuccessToast("Logged out successfully!");
        } catch (error) {
            set({ isLoggingOut: false });
            showErrorToast(error.response?.data?.message || "Logout failed!");
        }
    },

    authCheck: async () => {
        set({ isCheckingAuth: true });

        try {
            const res = await axios.get(`${API_BASE_URL}/api/auth/authCheck`, {
                withCredentials: true,
            });
    
            set({ user: res.data.user, isCheckingAuth: false });
            localStorage.setItem("cnnct_user", JSON.stringify(res.data.user));
        } catch (error) {
            set({ user: null, isCheckingAuth: false });
            localStorage.removeItem("cnnct_user");
        }
    },
    
    updateUser: (updatedUserData) => {
        set({ user: updatedUserData });
        localStorage.setItem("cnnct_user", JSON.stringify(updatedUserData));
    },
}));
