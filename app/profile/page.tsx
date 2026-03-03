"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    bio: "",
    skills: "",
    role: "BEGINNER",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setForm({
          name: data.name ?? "",
          bio: data.bio ?? "",
          skills: data.skills ?? "",
          role: data.role ?? "BEGINNER",
        });
        setLoading(false);
      });
  }, [session]);

  if (status === "loading" || loading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">个人设置</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl">
                {form.name[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{form.name || "未设置昵称"}</CardTitle>
              <p className="text-sm text-muted-foreground">{session.user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">昵称</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="你的昵称"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>身份</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "BEGINNER", label: "技术小白" },
                  { value: "EXPERT", label: "技术高手" },
                  { value: "BOTH", label: "两者兼备" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: option.value })}
                    className={`p-2 rounded-lg border text-sm transition-colors ${
                      form.role === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">个人简介</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="简单介绍一下你自己..."
                rows={3}
              />
            </div>

            {(form.role === "EXPERT" || form.role === "BOTH") && (
              <div className="space-y-2">
                <Label htmlFor="skills">技能标签</Label>
                <Input
                  id="skills"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="例：Next.js, Python, Docker, CI/CD（用逗号分隔）"
                />
                <p className="text-xs text-muted-foreground">多个技能用逗号分隔</p>
              </div>
            )}

            <Button type="submit" className="w-full gap-2" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  已保存
                </>
              ) : (
                "保存设置"
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
