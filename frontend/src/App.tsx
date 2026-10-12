import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute"

import LoginPage from "@/pages/LoginPage.tsx";
import ChatDashboard from "@/pages/ChatDashboard.tsx";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>

                    <Route element={<PublicRoute />}>
                        <Route path="/login" element={<LoginPage />} />
                    </Route>

                    <Route element={<ProtectedRoute />}>
                        <Route path="/channels/@me" element={<ChatDashboard />} />
                        <Route path="/channels/:serverId/:channelId" element={<ChatDashboard />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/channels/@me" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
