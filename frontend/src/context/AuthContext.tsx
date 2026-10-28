import React, { createContext, useContext, useState } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string, user: any) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode}> = ({children}) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return !!localStorage.getItem("auth_token")
    })

    const login = (token: string, user: any) => {
        localStorage.setItem("auth_token", token)
        if (user) {
            localStorage.setItem("user_info", JSON.stringify(user))
        }
        setIsAuthenticated(true)
    }

    const logout = () => {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_info")
        setIsAuthenticated(false)
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