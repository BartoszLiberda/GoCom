import React, { createContext, useContext, useState } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode}> = ({children}) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return localStorage.getItem("mock_auth") === "true"
    })

    const login = () => {
        localStorage.setItem("mock_auth", "true")
        setIsAuthenticated(true);
    }

    const logout = () => {
        localStorage.removeItem("mock_auth");
        setIsAuthenticated(false);
    }

    return(
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context) throw new Error("useAuth must be used within a AuthProvider");
    return context;
}