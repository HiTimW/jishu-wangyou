"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, ArrowUpRight, ArrowDownLeft, Loader2, Plus, Minus } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

const typeConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  RECHARGE: { label: "充值", color: "text-green-600 dark:text-green-400", icon: <ArrowDownLeft className="h-3.5 w-3.5" /> },
  EARN: { label: "收入", color: "text-green-600 dark:text-green-400", icon: <ArrowDownLeft className="h-3.5 w-3.5" /> },
  SPEND: { label: "支出", color: "text-red-500", icon: <ArrowUpRight className="h-3.5 w-3.5" /> },
  FREEZE: { label: "冻结", color: "text-orange-500", icon: <Minus className="h-3.5 w-3.5" /> },
  UNFREEZE: { label: "解冻", color: "text-blue-500", icon: <Plus className="h-3.5 w-3.5" /> },
  WITHDRAW: { label: "提现", color: "text-purple-500", icon: <ArrowUpRight className="h-3.5 w-3.5" /> },
};

export default function WalletPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<{ tokenBalance: number; frozenTokens: number; transactions: Transaction[] } | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/wallet")
      .then((r) => r.json())
      .then(setData);
  }, [session]);

  if (status === "loading" || !data) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">我的钱包</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <Coins className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-3xl font-bold">{data.tokenBalance}</p>
                <p className="text-sm text-muted-foreground">可用积分</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Coins className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{data.frozenTokens}</p>
                <p className="text-sm text-muted-foreground">冻结积分</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button asChild>
          <Link href="/wallet/recharge">充值积分</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/wallet/withdraw">申请提现</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">积分流水</CardTitle>
        </CardHeader>
        <CardContent>
          {data.transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">暂无交易记录</p>
          ) : (
            <div className="space-y-3">
              {data.transactions.map((tx) => {
                const config = typeConfig[tx.type] ?? { label: tx.type, color: "text-foreground", icon: null };
                return (
                  <div key={tx.id} className="flex items-start justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center h-8 w-8 rounded-full bg-muted ${config.color}`}>
                        {config.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-xs">{config.label}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString("zh-CN")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`font-semibold text-sm ${tx.amount > 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
