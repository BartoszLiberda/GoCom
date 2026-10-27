import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {Card} from "@/components/ui/card.tsx";
import goComLogo from "@/assets/GoComLogo.svg";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import { apiFetch } from "@/lib/api";

export default function SetupPage() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSetup = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try{
            await apiFetch('/setup' , {
                method: "POST",
                body: JSON.stringify({ email, username, password}),
            })

            login()
            navigate("/")
        } catch(err: any){
            setError(err.message || "Setup failed. Please try again")
        }finally{
            setIsLoading(false)
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Card className="pt-8 pb-8 pl-12 pr-12 w-85">
                <div className="flex flex-col items-center justify-center pb-5">
                    <img src={goComLogo} alt="GoComLogo" height={100} width={100} />
                </div>
                <h1 className="flex justify-center font-bold text-lg pb-5">[Server_Name]</h1>
                {error && (
                    <div className="mb-4 text-sm text-red-500 text-center">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSetup}>
                    <Input
                        className="p-4 mb-2"
                        id="email"
                        placeholder="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        className="p-4 mb-2"
                        id="username"
                        placeholder="Username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <Input
                        className="p-4"
                        id="password"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <div className="pt-5">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Setting up..." : "Setup"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}