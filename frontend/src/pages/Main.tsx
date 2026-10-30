import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Outlet } from "react-router-dom"

export default function Main() {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-full bg-background overflow-hidden">
                
                <AppSidebar />
                
                <main className="flex-1 flex flex-col h-full relative">
                    <div className="md:hidden p-4 border-b absolute top-0 left-0 z-10">
                        <SidebarTrigger />
                    </div>

                    <Outlet />
                </main>

            </div>
        </SidebarProvider>
    )
}