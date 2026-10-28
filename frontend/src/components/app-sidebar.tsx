import * as React from "react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    //SidebarMenuSub,
    //SidebarMenuSubButton,
    //SidebarMenuSubItem,
    SidebarRail,
    SidebarFooter,
} from "@/components/ui/sidebar"

import {
    IconServer,
    IconUsers,
} from "@tabler/icons-react"

import { Separator } from "@/components/ui/separator"

import {NavUser} from "@/components/navUser.tsx";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <div className="w-2/10 flex bg-zinc-900/20">
            <Sidebar collapsible="none" {...props}>
                <SidebarHeader>
                    <SidebarMenu>
                        <div className="flex items-center justify-between">
                            <SidebarMenuItem>
                                <h1 className="font-bold text-xl">Server Name</h1>
                            </SidebarMenuItem>
                            <div className="flex items-center justify-around">
                                <SidebarMenuItem>
                                    <SidebarMenuButton>
                                        <IconServer className="w-5! h-5!"/>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton>
                                        <IconUsers className="w-5! h-5!"/>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </div>
                        </div>
                    </SidebarMenu>
                </SidebarHeader>
                <Separator/>
                <SidebarContent>
                    <SidebarGroup>
                        <span>Server Channels / Direct Messages</span>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarRail />
                <Separator/>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <NavUser></NavUser>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <Separator orientation="vertical"/>
        </div>
    )
}
