"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Coins, CheckCircle2, Clock, MessageSquare } from "lucide-react";

interface RequestDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  reward: number;
  status: string;
  createdAt: string;
  author: { id: string; name: string; avatar?: string | null; bio?: string | null };
  responses: Array<{
    id: string;
    content: string;
    accepted: boolean;
    createdAt: string;
    expert: { id: string; name: string; avatar?: string | null; skills?: string | null };
  }>;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  OPEN: { label: "待解答", variant: "default" },
  IN_PROGRESS: { label: "解答中", variant: "secondary" },
  RESOLVED: { label: "已解决", variant: "outline" },
  CLOSED: { label: "已关闭", variant: "destructive" },
};

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);

  async function fetchRequest() {
    const res = await fetch(`/api/requests/${id}`);
    if (res.ok) {
      setRequest(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchRequest();
  }, [id]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch(`/api/requests/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: reply }),
    });

    if (res.ok) {
      setReply("");
      fetchRequest();
    }
    setSubmitting(false);
  }

  async function handleAccept(responseId: string) {
    setAccepting(responseId);
    const res = await fetch(`/api/responses/${responseId}/accept`, {
      method: "POST",
    });

    if (res.ok) {
      fetchRequest();
    }
    setAccepting(null);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">求助不存在</p>
        <Button variant="link" asChild>
          <Link href="/requests">返回求助列表</Link>
        </Button>
      </div>
    );
  }

  const isAuthor = session?.user?.id === request.author.id;
  const statusInfo = statusMap[request.status] ?? { label: request.status, variant: "outline" as const };
  const alreadyReplied = request.responses.some((r) => r.expert.id === session?.user?.id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-4">
        <Link href="/requests" className="text-sm text-muted-foreground hover:text-foreground">
          ← 返回求助列表
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-bold">{request.title}</h1>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-medium text-yellow-600 dark:text-yellow-400">{request.reward} 积分悬赏</span>
            </span>
            <span>{request.category}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {new Date(request.createdAt).toLocaleDateString("zh-CN")}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
            {request.description}
          </div>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs">
                {request.author.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              由 <span className="font-medium text-foreground">{request.author.name}</span> 发布
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Responses */}
      <div className="space-y-4 mb-6">
        <h2 className="font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          {request.responses.length} 个回答
        </h2>

        {request.responses.map((response) => (
          <Card key={response.id} className={response.accepted ? "border-green-500 dark:border-green-700" : ""}>
            <CardContent className="pt-4">
              {response.accepted && (
                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-medium mb-3">
                  <CheckCircle2 className="h-4 w-4" />
                  已采纳答案
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">
                    {response.expert.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-sm font-medium">{response.expert.name}</span>
                  {response.expert.skills && (
                    <span className="text-xs text-muted-foreground ml-2">{response.expert.skills.split(",").slice(0, 2).join(", ")}</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(response.createdAt).toLocaleDateString("zh-CN")}
                </span>
              </div>
              <div className="text-sm whitespace-pre-wrap">{response.content}</div>

              {isAuthor && request.status !== "RESOLVED" && !response.accepted && (
                <div className="mt-3 pt-3 border-t">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(response.id)}
                    disabled={accepting === response.id}
                    className="gap-2"
                  >
                    {accepting === response.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    采纳此答案（结算 {request.reward} 积分）
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reply form */}
      {session && !isAuthor && request.status !== "RESOLVED" && !alreadyReplied && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-medium mb-3">提交你的解答</h3>
            <form onSubmit={handleReply} className="space-y-3">
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="详细描述解决方案，包括具体步骤和命令..."
                rows={5}
                required
              />
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "提交回答"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {!session && (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground mb-3">登录后才能回答问题</p>
            <Button asChild>
              <Link href="/login">立即登录</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {alreadyReplied && (
        <Card>
          <CardContent className="py-4 text-center text-sm text-muted-foreground">
            你已提交过回答，等待提问者采纳
          </CardContent>
        </Card>
      )}
    </div>
  );
}
