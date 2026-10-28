import {
    IconLogout,
    IconSettings,
} from "@tabler/icons-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

import { useAuth } from '../context/AuthContext';

export function NavUser() {
    const { user, logout } = useAuth();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={user?.avatar_url} alt={user?.username} />
                            <AvatarFallback className="rounded-lg">{user?.username?.slice(0,2).toUpperCase() || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{user?.username}</span>
                            <span className="truncate text-xs text-muted-foreground">
                                {user?.email}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center px-1 py-1.5">
                        <SidebarMenuButton>
                            <IconSettings className="w-5! h-5!" />
                        </SidebarMenuButton>
                        <SidebarMenuButton onClick={logout}>
                            <IconLogout className="w-5! h-5! text-red-400 hover:text-red-300"/>
                        </SidebarMenuButton>
                    </div>
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
