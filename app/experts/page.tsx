"use client";

import { useState, useEffect } from "react";
import { ExpertCard } from "@/components/ExpertCard";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

interface Expert {
  id: string;
  name: string;
  bio?: string | null;
  skills?: string | null;
  avatar?: string | null;
  _count: { responses: number };
}

export default function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/experts")
      .then((r) => r.json())
      .then((data) => {
        setExperts(data);
        setLoading(false);
      });
  }, []);

  const filtered = experts.filter((e) =>
    search
      ? e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.skills?.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">技术专家</h1>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="搜索专家或技能..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>暂无专家</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((expert) => (
            <ExpertCard
              key={expert.id}
              id={expert.id}
              name={expert.name}
              bio={expert.bio}
              skills={expert.skills}
              avatar={expert.avatar}
              responseCount={expert._count.responses}
            />
          ))}
        </div>
      )}
    </div>
  );
}
