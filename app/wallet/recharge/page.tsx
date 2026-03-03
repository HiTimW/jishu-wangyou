"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Coins } from "lucide-react";

const PRESET_AMOUNTS = [10, 30, 50, 100, 200];

export default function RechargePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [amount, setAmount] = useState(50);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newBalance, setNewBalance] = useState(0);

  if (!session) {
    router.push("/login");
    return null;
  }

  const tokens = amount * 10;

  async function handleRecharge() {
    setLoading(true);
    const res = await fetch("/api/wallet/recharge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    if (res.ok) {
      const data = await res.json();
      setNewBalance(data.balance?.tokenBalance ?? 0);
      setSuccess(true);
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
            <h2 className="text-xl font-bold">充值成功！</h2>
            <p className="text-muted-foreground">
              成功获得 <span className="font-bold text-foreground">{tokens} 积分</span>
            </p>
            <p className="text-sm text-muted-foreground">
              当前余额：{newBalance} 积分
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Button asChild>
                <Link href="/requests/new">发布求助</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/wallet">返回钱包</Link>
              </Button>
            </div>
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
            <Coins className="h-5 w-5 text-yellow-500" />
            充值积分
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-muted text-center">
            <p className="text-sm text-muted-foreground mb-1">充值汇率</p>
            <p className="text-xl font-bold">1 元人民币 = 10 积分</p>
          </div>

          <div>
            <Label className="mb-2 block">快速选择金额</Label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(a)}
                  className={`p-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    amount === a
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  ¥{a}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">自定义金额（元）</Label>
            <Input
              id="amount"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">充值金额</span>
              <span>¥{amount} 元</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>获得积分</span>
              <span className="text-yellow-600 dark:text-yellow-400">{tokens} 积分</span>
            </div>
          </div>

          <Button onClick={handleRecharge} className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `确认充值 ¥${amount} → ${tokens} 积分`
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            * 这是模拟充值，实际项目需接入支付宝/微信支付
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
