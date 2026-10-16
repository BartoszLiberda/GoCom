import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

function MainContent(){

    return (
        <div className="flex h-screen w-full text-white">
            <SidebarProvider>

                <AppSidebar className="w-full h-screen text-white" />

                <SidebarInset className="bg-zinc-950 text-white flex flex-col h-screen">
                    <div className="flex justify-center items-center h-full w-full">
                        Server Channel Chat / Direct Message Chat
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}

export default function Main() {

    return (
        <MainContent />
    );
}