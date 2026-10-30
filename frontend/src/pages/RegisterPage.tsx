import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { apiFetch } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import goComLogo from "@/assets/GoComLogo.svg"

export default function RegisterPage() {
    const { code } = useParams()
    const navigate = useNavigate()

    const [isValidating, setIsValidating] = useState(true)
    const [isValid, setIsValid] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    useEffect(() => {
        const checkCode = async () => {
            try {
                const res = await apiFetch(`/invites/${code}`)
                if ((res as any).valid) {
                    setIsValid(true)
                } else {
                    setError("This invite link is invalid or has expired.")
                }
            } catch (err) {
                setError("Failed to validate invite link.")
            } finally {
                setIsValidating(false)
            }
        }
        if (code) checkCode()
    }, [code])

    const handleRegister = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            await apiFetch("/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    invite_code: code,
                    email,
                    username,
                    password,
                })
            })

            navigate("/login", { state: { message: "Account created! You can now log in." } })
        } catch (err: any) {
            setError(err.message || "Failed to register. Username or email might be taken.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isValidating) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <p className="text-muted-foreground">Validating invite...</p>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Card className="pt-8 pb-8 pl-12 pr-12 w-85">
                <div className="flex flex-col items-center justify-center pb-5">
                    <img src={goComLogo} alt="GoComLogo" height={100} width={100} />
                </div>
                
                <h1 className="flex justify-center font-bold text-lg pb-1">Create an Account</h1>
                <p className="text-center text-sm text-muted-foreground pb-5">
                    You've been invited to join the server!
                </p>

                {error && (
                    <div className="mb-4 text-sm text-red-500 text-center">
                        {error}
                    </div>
                )}

                {!isValid ? (
                    <div className="pt-2">
                        <Button className="w-full" onClick={() => navigate("/login")}>
                            Back to Login
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleRegister}>
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
                                {isLoading ? "Creating Account..." : "Register"}
                            </Button>
                        </div>
                        <div className="pt-5 flex justify-center">
                            <Link to="/login" className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors">
                                Already have an account?
                            </Link>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    )
}