import { useEffect, useState} from "react"
import { apiFetch } from "@/lib/api"
import { NavUser } from "@/components/navUser.tsx";
import { useNavigate } from "react-router-dom";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    SidebarGroupContent,
    SidebarGroupLabel,
} from "@/components/ui/sidebar"

import {
    IconHash,
    IconVolume,
    IconUserPlus,
} from "@tabler/icons-react"

import { Separator } from "@/components/ui/separator"


interface ServerSettings {
    server_name: string
}

interface Channel {
    id: number
    category_id: number | null
    name: string
    type: string
}

interface Category {
    id: number
    name: string
    channels: Channel[]
}

interface ChannelsResponse {
    categories: Category[]
    top_channels: Channel[]
}

export function AppSidebar() {
    const [serverName, setServerName] = useState<string>("Loading...")
    const [categories, setCategories] = useState<Category[]>([])
    const [topChannels, setTopChannels] = useState<Channel[]>([])

    const navigate = useNavigate()

    const handleGenerateInvite = async () => {
        try {
            const res = await apiFetch("/invites", { method: "POST" })
            const code = (res as any).code
            
            const inviteUrl = `${window.location.origin}/invite/${code}`
            
            await navigator.clipboard.writeText(inviteUrl)
            alert("Invite link copied to clipboard!\n" + inviteUrl)
        } catch (error) {
            console.error("Failed to generate invite", error)
            alert("Failed to generate invite link.")
        }
    }

    useEffect(() => {
        const fetchSidebarData = async () => {
            try {
                const [serverData, channelsData] = await Promise.all([
                    apiFetch("/server"),
                    apiFetch("/channels")
                ])

                setServerName((serverData as ServerSettings).server_name)
                setCategories((channelsData as ChannelsResponse).categories || [])
                setTopChannels((channelsData as ChannelsResponse).top_channels || [])
            } catch (error) {
                console.log("Failed to load sidebar data", error)
            }
        }
        fetchSidebarData()
    }, [])

    return (
        <div className="flex">
            <Sidebar>
                <SidebarHeader>
                    <SidebarMenu>
                        <div className="flex items-center justify-between group">
                            <SidebarMenuItem>
                                <h1 className="font-bold text-xl">{serverName}</h1>
                            </SidebarMenuItem>
                            <button 
                                onClick={handleGenerateInvite}
                                className="p-1 rounded hover:bg-indigo-500 text-gray-400 hover:text-white transition-colors"
                                title="Invite People"
                            >
                                <IconUserPlus className="h-5 w-5" />
                            </button>
                        </div>
                    </SidebarMenu>
                </SidebarHeader>
                <Separator/>
                <SidebarContent>
                    {/* Render any top-level channels (not in a category) */}
                    {topChannels.length > 0 && (
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {topChannels.map((channel) => (
                                        <SidebarMenuItem key={channel.id}>
                                            <SidebarMenuButton onClick={() => navigate(`/channels/@me/${channel.id}`)}>
                                                {channel.type === "voice" ? <IconVolume className="h-4 w-4 opacity-70" /> : <IconHash className="h-4 w-4 opacity-70" />}
                                                <span>{channel.name}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    )}

                    {/* Render Categories and their nested channels */}
                    {categories.map((category) => (
                        <SidebarGroup key={category.id}>
                            <SidebarGroupLabel className="uppercase text-xs font-bold tracking-wider opacity-70">
                                {category.name}
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {category.channels.map((channel) => (
                                        <SidebarMenuItem key={channel.id}>
                                            <SidebarMenuButton onClick={() => navigate(`/channels/@me/${channel.id}`)}>
                                                {channel.type === "voice" ? <IconVolume className="h-4 w-4 opacity-70" /> : <IconHash className="h-4 w-4 opacity-70" />}
                                                <span>{channel.name}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ))}
                </SidebarContent>
                <Separator/>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <NavUser/>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <Separator orientation="vertical"/>
        </div>
    )
}
