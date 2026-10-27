import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute"
import { useEffect, useState} from "react"

import LoginPage from "@/pages/LoginPage.tsx";
import Main from "@/pages/Main.tsx";
import SetupPage from "@/pages/SetupPage.tsx";

import { apiFetch } from "@/lib/api.ts"

export default function App() {
    const [setupRequired, setSetupRequired] = useState<boolean | null>(null)

    useEffect(() => {
        apiFetch('/setup/status')
            .then((data) => {
                setSetupRequired(data.setup_required)
            })
            .catch((err) => {
                console.error("Failed to connect to backend", err)
                setSetupRequired(false)
            })
    }, []);

    if (setupRequired === null) {
        return (
            <div>
                <p>Connecting to server...</p>
            </div>
        );
    }

    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {setupRequired ? (
                        <>
                            <Route path="/setup" element={<SetupPage />}/>
                            <Route path="*" element={<Navigate to="/setup" replace />}/>
                        </>
                    ) : (
                        <>
                            <Route element={<PublicRoute />}>
                                <Route path="/login" element={<LoginPage />} />
                            </Route>

                            <Route element={<ProtectedRoute />}>
                                <Route path="/channels/@me" element={<Main />} />
                                <Route path="/channels/:serverId/:channelId" element={<Main />} />
                            </Route>

                            <Route path="/setup" element={<Navigate to="/login" replace />}/>
                            <Route path="*" element={<Navigate to="/channels/@me" replace />} />
                        </>
                    )}
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
