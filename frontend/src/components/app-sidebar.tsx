import * as React from "react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
    SidebarFooter,
} from "@/components/ui/sidebar"

import { Separator} from "@/components/ui/Separator"

import {NavUser} from "@/components/navUser.tsx";

// sample data.
const data = {
    user: {
        name: "Bartosz",
        email: "Bartoszliberda@gmail.com",
        avatar: "",
    },
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar className="w-2/10 bg-zinc-900/20" collapsible="none" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" >
                            <h1 className="font-bold text-xl">Server Name</h1>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <Separator/>
            <SidebarContent>
                <SidebarGroup>

                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
            <Separator/>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <NavUser user={data.user}></NavUser>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
