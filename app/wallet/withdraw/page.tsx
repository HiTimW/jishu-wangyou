"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, Coins } from "lucide-react";

export default function WithdrawPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [form, setForm] = useState({ tokens: 100, bankInfo: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/wallet")
      .then((r) => r.json())
      .then((d) => setBalance(d.tokenBalance ?? 0));
  }, [session]);

  if (!session) {
    router.push("/login");
    return null;
  }

  const platformFee = Math.floor(form.tokens * 0.1);
  const netTokens = form.tokens - platformFee;
  const amount = (netTokens / 10).toFixed(2);

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/wallet/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json();
      setError(data.error || "提现申请失败");
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold">申请已提交！</h2>
            <p className="text-muted-foreground text-sm">提现申请已提交，预计 1-3 个工作日处理</p>
            <Button asChild>
              <Link href="/wallet">返回钱包</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="mb-4">
        <Link href="/wallet" className="text-sm text-muted-foreground hover:text-foreground">
          ← 返回钱包
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            申请提现
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleWithdraw}>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-muted text-sm">
              可用积分：<span className="font-bold">{balance}</span> 积分
            </div>

            <div className="space-y-2">
              <Label htmlFor="tokens">提现积分数</Label>
              <Input
                id="tokens"
                type="number"
                min={100}
                max={balance}
                value={form.tokens}
                onChange={(e) => setForm({ ...form, tokens: parseInt(e.target.value) || 100 })}
                required
              />
              <p className="text-xs text-muted-foreground">最低提现 100 积分</p>
            </div>

            <div className="p-4 rounded-lg border space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">提现积分</span>
                <span>{form.tokens} 积分</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">平台手续费（10%）</span>
                <span className="text-red-500">-{platformFee} 积分</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>到账金额</span>
                <span className="text-green-600 dark:text-green-400">¥{amount}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankInfo">收款信息</Label>
              <Textarea
                id="bankInfo"
                value={form.bankInfo}
                onChange={(e) => setForm({ ...form, bankInfo: e.target.value })}
                placeholder="支付宝账号：xxx@xxx.com&#10;或银行卡号：xxxx xxxx xxxx xxxx&#10;开户行：xxx银行"
                rows={3}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {form.tokens > balance && (
              <p className="text-sm text-destructive">积分余额不足</p>
            )}

            <Button type="submit" className="w-full" disabled={loading || form.tokens > balance || form.tokens < 100}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "提交提现申请"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
