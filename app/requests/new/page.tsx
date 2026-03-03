"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Coins } from "lucide-react";
import Link from "next/link";

const CATEGORIES = ["环境配置", "报错调试", "代码理解", "UI设计", "其他"];

export default function NewRequestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "环境配置",
    reward: 50,
  });
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/wallet")
        .then((r) => r.json())
        .then((d) => setBalance(d.tokenBalance ?? 0));
    }
  }, [session]);

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (form.reward > balance) {
      setError("积分余额不足，请先充值");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "发布失败");
      setLoading(false);
      return;
    }

    const request = await res.json();
    router.push(`/requests/${request.id}`);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">发布求助</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Coins className="h-4 w-4 text-yellow-500" />
            当前积分余额：{balance} 积分
          </CardTitle>
          {balance === 0 && (
            <p className="text-sm text-muted-foreground">
              余额为零，
              <Link href="/wallet/recharge" className="text-primary hover:underline">
                立即充值
              </Link>
            </p>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">问题标题</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="简洁描述你的问题，例：Next.js 14 环境变量无法读取"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>问题分类</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      form.category === cat
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:border-primary/50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">详细描述</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="详细描述你的问题：遇到了什么错误？已经尝试了哪些方法？操作系统、版本等信息..."
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward">悬赏积分</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="reward"
                  type="number"
                  min={10}
                  max={balance}
                  value={form.reward}
                  onChange={(e) => setForm({ ...form, reward: parseInt(e.target.value) || 0 })}
                  className="max-w-[150px]"
                />
                <span className="text-sm text-muted-foreground">积分（最少 10 积分）</span>
              </div>
              <p className="text-xs text-muted-foreground">
                发布后积分冻结，专家解决问题后自动结算（平台收取 10% 手续费）
              </p>
              {form.reward > balance && (
                <p className="text-xs text-destructive">积分余额不足</p>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <div className="p-6 pt-0">
            <Button type="submit" className="w-full" disabled={loading || form.reward > balance}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `发布求助（冻结 ${form.reward} 积分）`}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
