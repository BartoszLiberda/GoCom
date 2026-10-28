import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export interface User {
    id: number
    username: string
    email: string
    avatar_url?: string
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null
    isLoading: boolean
    login: (token: string, user: any) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode}> = ({children}) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        const verifySession = async () => {
            const token = localStorage.getItem("auth_token")

            if (!token) {
                setIsLoading(false)
                return
            }

            try {
                const freshUser = await apiFetch("/users/@me")

                setUser(freshUser)
                setIsAuthenticated(true)
            } catch (error) {
                console.error("Session invalid or expierd", error)
                localStorage.removeItem("auth_token")
                setIsAuthenticated(false)
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }

        verifySession()
    }, [])

    const login = (token: string, userData: User) => {
        localStorage.setItem("auth_token", token)
        setIsAuthenticated(true)
        setUser(userData)
    }

    const logout = () => {
        localStorage.removeItem("auth_token")
        setIsAuthenticated(false)
        setUser(null)
    }

    return(
        <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout }}>
            {!isLoading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context) throw new Error("useAuth must be used within a AuthProvider");
    return context;
}