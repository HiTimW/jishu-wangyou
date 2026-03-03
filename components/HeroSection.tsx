import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Users } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground mb-6">
          <Zap className="h-3.5 w-3.5 text-yellow-500" />
          AI 时代的技术互助平台
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          我在互联网上
          <span className="text-primary"> 懂技术 </span>
          的朋友
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          遇到了 vibe coding 解决不了的配置问题？找技术网友帮你！
          连接技术小白与技术高手，用积分激励快速解决问题。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button size="lg" asChild className="gap-2">
            <Link href="/register?role=BEGINNER">
              我需要帮助
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="gap-2">
            <Link href="/register?role=EXPERT">
              我能帮忙
              <Users className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-3 p-6 rounded-xl border bg-card">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold">快速响应</h3>
            <p className="text-sm text-muted-foreground text-center">
              积分赏金激励专家快速回复，通常几分钟内获得解答
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 p-6 rounded-xl border bg-card">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold">安心付款</h3>
            <p className="text-sm text-muted-foreground text-center">
              积分先冻结，确认解决后才释放给专家，保障你的权益
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 p-6 rounded-xl border bg-card">
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold">技能互换</h3>
            <p className="text-sm text-muted-foreground text-center">
              不只是技术，设计、法律、运营…任何专业知识都可互助
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
