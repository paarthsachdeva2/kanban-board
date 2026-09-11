import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user")) || null
    );

    const login = async (email, password) => {
        const response = await api.post("/auth/login", {
            email,
            password
        });

        const { token } = response.data;

        localStorage.setItem("token", token);

        // Get basic user information from token
        const payload = JSON.parse(atob(token.split(".")[1]));

        const userData = {
            id: payload.userId
        };

        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        return response.data;
    };

    const register = async (name, email, password) => {
        const response = await api.post("/auth/register", {
            name,
            email,
            password
        });

        return response.data;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};