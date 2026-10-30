import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import { apiFetch } from "@/lib/api"
import { IconHash, IconVolume } from "@tabler/icons-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Channel {
    id: number
    category_id: number | null
    name: string
    type: string
}

interface Message {
    id: number
    channel_id: number 
    content: string
    created_at: string
    sender: {
        id: number
        username: string
        avatar_url: string | null
    }
}

export function ChannelView() {
    const { channelId } = useParams()
    const [channel, setChannel] = useState<Channel | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [newMessage, setNewMessage] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (!channelId) return

        let ws: WebSocket

        const loadChannelData = async () => {
            setIsLoading(true)
            try {
                const [channelData, messagesData] = await Promise.all([
                    apiFetch(`/channels/${channelId}`),
                    apiFetch(`/channels/${channelId}/messages`)
                ])
                
                setChannel(channelData as Channel)
                
                const fetchedMessages = (messagesData as Message[]) || []
                setMessages(fetchedMessages.reverse())

                const token = localStorage.getItem("auth_token") 
                const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
                const wsUrl = `${protocol}//localhost:8080/api/ws?token=${token}`
                
                ws = new WebSocket(wsUrl)

                ws.onmessage = (event) => {
                    const incomingMessage: Message = JSON.parse(event.data)
                    
                    if (incomingMessage.channel_id.toString() === channelId) {
                        setMessages((prev) => {
                            if (prev.some((msg) => msg.id === incomingMessage.id)) {
                                return prev
                            }
                            return [...prev, incomingMessage]
                        })
                    }
                }

                ws.onerror = (error) => {
                    console.error("WebSocket error:", error)
                }
            } catch (error) {
                console.error("Failed to load channel data", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadChannelData()

        return () => {
            if (ws) {
                ws.close()
            }
        }
    }, [channelId])

    const handleSendMessage = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        
        if (!newMessage.trim()) return

        const contentToSubmit = newMessage
        setNewMessage("") 

        try {
            await apiFetch(`/channels/${channelId}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: contentToSubmit }),
            })
        } catch (error) {
            console.error("Failed to send message", error)
            setNewMessage(contentToSubmit) 
        }
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#313338] text-gray-400">
                Loading...
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#313338] text-gray-100">
            <div className="h-12 border-b border-[#1E1F22] flex items-center px-4 shadow-sm shrink-0">
                <div className="flex items-center gap-2 font-bold text-base">
                    {channel?.type === "voice" ? <IconVolume className="h-5 w-5 text-gray-400" /> : <IconHash className="h-5 w-5 text-gray-400" />}
                    {channel?.name}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col justify-end h-full">
                        <div className="mb-4">
                            <div className="h-12 w-12 rounded-full bg-[#404249] flex items-center justify-center mb-2">
                                <IconHash className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Welcome to #{channel?.name}!</h1>
                            <p className="text-gray-400">This is the start of the #{channel?.name} channel.</p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className="flex gap-4 hover:bg-[#2E3035] p-1 -mx-1 rounded transition-colors">
                            <Avatar className="h-10 w-10 mt-0.5">
                                <AvatarImage src={msg.sender.avatar_url || undefined} />
                                <AvatarFallback className="bg-indigo-500 text-white">
                                    {msg.sender.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-2">
                                    <span className="font-medium text-green-400">{msg.sender.username}</span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(msg.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <span className="text-gray-200">{msg.content}</span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 pt-0 shrink-0">
                <div className="bg-[#383A40] rounded-lg flex items-center px-4">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Message #${channel?.name || "channel"}`}
                        className="bg-transparent w-full h-11 text-gray-200 placeholder-gray-400 focus:outline-none"
                        autoComplete="off"
                    />
                </div>
            </form>
        </div>
    )
}