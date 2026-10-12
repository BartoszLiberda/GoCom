import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {Card} from "@/components/ui/card.tsx";
import goComLogo from "@/assets/GoComLogo.svg";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleMockLogin = (e: React.SubmitEvent) => {
        e.preventDefault()
        login()
        navigate("/")
    }

    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Card className="pt-8 pb-8 pl-12 pr-12 w-85">
                <div className="flex flex-col items-center justify-center pb-5">
                    <img src={goComLogo} alt="GoComLogo" height={100} width={100} />
                </div>
                <h1 className="flex justify-center font-bold text-lg pb-5">[Server_Name]</h1>
                <form onSubmit={handleMockLogin}>
                    <Input
                        className="p-4"
                        id="email"
                        placeholder="Email"
                        type="email"
                        required
                    />
                    <Input
                        className="p-4"
                        id="password"
                        placeholder="Password"
                        type="password"
                        required
                    />
                    <div className="pt-5">
                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}