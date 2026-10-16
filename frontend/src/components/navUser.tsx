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

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function NavUser({user,}: {
    user: {
        name: string
        email: string
        avatar: string
    }
}) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="rounded-lg">BL</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{user.name}</span>
                            <span className="truncate text-xs text-muted-foreground">
                                {user.email}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center px-1 py-1.5">
                        <SidebarMenuButton>
                            <IconSettings className="!w-5 !h-5" />
                        </SidebarMenuButton>
                        <SidebarMenuButton onClick={handleLogout}>
                            <IconLogout className="!w-5 !h-5 text-red-400 hover:text-red-300"/>
                        </SidebarMenuButton>
                    </div>
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
