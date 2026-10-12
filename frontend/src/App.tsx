import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

function App() {
  return (
    <>
      <div className="flex h-screen w-full items-center justify-center">
        <Card className="p-7">
            <Label htmlFor="email">Email</Label>
            <Input
                id="email"
                type="email"
                placeholder="Email"
                required
            />
            <Label htmlFor="password">Password</Label>
            <Input
                id="password"
                type="password"
                required
            />
            <Button type="submit" className="w-full">
                Login
            </Button>
        </Card>
      </div>
    </>
  )
}

export default App
