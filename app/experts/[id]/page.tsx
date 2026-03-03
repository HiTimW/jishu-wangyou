"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, MessageSquare } from "lucide-react";

interface ExpertResponse {
  id: string;
  request: { id: string; title: string; category: string };
}

interface Expert {
  id: string;
  name: string;
  bio: string | null;
  skills: string | null;
  avatar: string | null;
  responses: ExpertResponse[];
  _count: { responses: number };
}

export default function ExpertProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [expert, setExpert] = useState<Expert | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/experts/${id}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setExpert(data);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !expert) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">未找到该用户</p>
      </div>
    );
  }

  const skills = expert.skills
    ? expert.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl">
                {expert.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{expert.name}</h1>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {expert._count.responses} 次回答
              </div>
              {expert.bio && (
                <p className="text-sm text-muted-foreground mt-2">{expert.bio}</p>
              )}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              )}
            </div>
            <Button asChild>
              <Link href={`/messages?with=${expert.id}`} className="gap-2">
                <MessageSquare className="h-4 w-4" />
                发消息
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">已解答的问题</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {expert.responses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">暂无已解答问题</p>
          ) : (
            expert.responses.map((r) => (
              <Link key={r.id} href={`/requests/${r.request.id}`}>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.request.title}</p>
                    <Badge variant="outline" className="text-xs mt-0.5">{r.request.category}</Badge>
                  </div>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
