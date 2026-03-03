"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, FileQuestion, Loader2, MessageSquare, Plus, Wallet } from "lucide-react";

interface DashboardUser {
  id: string;
  name: string;
  role: string;
  tokenBalance: number;
  frozenTokens: number;
  requests: Array<{
    id: string;
    title: string;
    status: string;
    reward: number;
    responses: { id: string }[];
  }>;
  responses: Array<{
    id: string;
    accepted: boolean;
    request: { title: string; id: string };
  }>;
}

const statusLabels: Record<string, string> = {
  OPEN: "待解答",
  IN_PROGRESS: "解答中",
  RESOLVED: "已解决",
  CLOSED: "已关闭",
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/dashboard")
        .then((r) => {
          if (r.status === 401) {
            router.push("/login");
            return null;
          }
          return r.json();
        })
        .then((data) => {
          if (data) setUser(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">你好，{user.name}！</h1>
          <p className="text-muted-foreground text-sm">
            身份：{user.role === "BEGINNER" ? "技术小白" : user.role === "EXPERT" ? "技术高手" : "两者兼备"}
          </p>
        </div>
        <Button asChild>
          <Link href="/requests/new" className="gap-2">
            <Plus className="h-4 w-4" />
            发布求助
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <Coins className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{user.tokenBalance}</p>
                <p className="text-xs text-muted-foreground">可用积分</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Coins className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{user.frozenTokens}</p>
                <p className="text-xs text-muted-foreground">冻结积分</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <FileQuestion className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{user.requests.length}</p>
                <p className="text-xs text-muted-foreground">我的求助</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{user.responses.length}</p>
                <p className="text-xs text-muted-foreground">我的回答</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* My requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">我的求助</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/requests">查看全部</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.requests.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <p>还没有发布求助</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/requests/new">发布第一个求助</Link>
                </Button>
              </div>
            ) : (
              user.requests.map((req) => (
                <Link key={req.id} href={`/requests/${req.id}`}>
                  <div className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{req.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {req.responses.length} 个回复 · {req.reward} 积分
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs ml-2 shrink-0">
                      {statusLabels[req.status] ?? req.status}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">快捷操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-3" asChild>
              <Link href="/wallet">
                <Wallet className="h-4 w-4" />
                钱包管理
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3" asChild>
              <Link href="/wallet/recharge">
                <Coins className="h-4 w-4" />
                充值积分
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3" asChild>
              <Link href="/requests/new">
                <Plus className="h-4 w-4" />
                发布新求助
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3" asChild>
              <Link href="/profile">
                <MessageSquare className="h-4 w-4" />
                编辑个人资料
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
