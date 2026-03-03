"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string };
  receiver: { id: string; name: string };
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const withUserId = searchParams.get("with");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<{ userId: string; name: string; lastMessage: string }[]>([]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [session, withUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchMessages() {
    const url = withUserId ? `/api/messages?with=${withUserId}` : "/api/messages";
    const res = await fetch(url);
    if (res.ok) {
      const data: Message[] = await res.json();
      if (withUserId) {
        setMessages(data);
      } else {
        // Build conversations list
        const convMap = new Map<string, { userId: string; name: string; lastMessage: string }>();
        data.forEach((m) => {
          const otherId = m.sender.id === session?.user?.id ? m.receiver.id : m.sender.id;
          const otherName = m.sender.id === session?.user?.id ? m.receiver.name : m.sender.name;
          if (!convMap.has(otherId)) {
            convMap.set(otherId, { userId: otherId, name: otherName, lastMessage: m.content });
          }
        });
        setConversations(Array.from(convMap.values()));
      }
    }
    setLoading(false);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !withUserId) return;

    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: withUserId, content: newMessage }),
    });

    if (res.ok) {
      setNewMessage("");
      fetchMessages();
    }
    setSending(false);
  }

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">消息中心</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
        {/* Conversations sidebar */}
        <Card className="p-0 overflow-hidden">
          <div className="p-3 border-b font-medium text-sm">会话列表</div>
          <div className="overflow-y-auto h-full">
            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center p-4">暂无会话</p>
            ) : (
              conversations.map((conv) => (
                <Link
                  key={conv.userId}
                  href={`/messages?with=${conv.userId}`}
                  className={`flex items-center gap-3 p-3 hover:bg-muted transition-colors ${
                    withUserId === conv.userId ? "bg-muted" : ""
                  }`}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{conv.name[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>

        {/* Message thread */}
        <Card className="md:col-span-2 p-0 flex flex-col overflow-hidden">
          {withUserId ? (
            <>
              <div className="p-3 border-b font-medium text-sm">
                {conversations.find((c) => c.userId === withUserId)?.name ?? "对话"}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isMe = msg.sender.id === session.user?.id;
                  return (
                    <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="text-xs">
                          {msg.sender.name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                        isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendMessage} className="p-3 border-t flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="输入消息..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={sending}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              选择一个会话开始聊天
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
