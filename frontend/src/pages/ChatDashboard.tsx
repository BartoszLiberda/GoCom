import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function ChatDashboard() {

    return (
        <div className="flex h-screen w-full text-white">
            <SidebarProvider>

                <AppSidebar />

                <SidebarInset className="text-white flex flex-col h-screen">

                    <div className="flex flex-1 flex-col gap-4 p-4 overflow-y-auto">
                        <div className="flex-1 rounded-xl bg-zinc-900/20 border border-zinc-800/50 p-4 flex items-center justify-center text-zinc-500">
                            Chat Messages
                        </div>
                    </div>

                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}