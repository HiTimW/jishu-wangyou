import Link from "next/link";
import { HeroSection } from "@/components/HeroSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">如何使用</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "充值积分，发布求助",
                desc: "充值获得积分，发布你的技术问题并设置赏金。积分自动冻结保障专家权益。",
              },
              {
                step: "02",
                title: "专家抢答，解决问题",
                desc: "平台上的技术专家看到你的求助后，会提供详细解答，直到你满意为止。",
              },
              {
                step: "03",
                title: "确认答案，释放积分",
                desc: "问题解决后点击确认，积分自动结算给专家。专家可随时提现到银行卡。",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">积分体系</h2>
            <p className="text-center text-muted-foreground mb-10">公平透明，保障双方权益</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: "💰", label: "充值汇率", value: "1 元 = 10 积分" },
                { icon: "🎁", label: "专家收益", value: "解答获赏金 90%" },
                { icon: "💸", label: "最低提现", value: "100 积分 = 10 元" },
                { icon: "🔒", label: "安全冻结", value: "确认解决再付款" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl border bg-card">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-semibold">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">准备好了吗？</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            加入技术网友，找到你的技术伙伴。不管你是需要帮助还是愿意帮助别人，都欢迎你！
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="gap-2">
              <Link href="/register">
                立即注册
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link href="/requests">浏览求助</Link>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/70">
            {["无需前期费用", "专家快速响应", "安全积分机制", "支持提现变现"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
