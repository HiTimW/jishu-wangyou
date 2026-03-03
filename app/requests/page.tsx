"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RequestCard } from "@/components/RequestCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2 } from "lucide-react";

const CATEGORIES = ["全部", "环境配置", "报错调试", "代码理解", "UI设计", "其他"];
const STATUSES = [
  { value: "", label: "全部状态" },
  { value: "OPEN", label: "待解答" },
  { value: "IN_PROGRESS", label: "解答中" },
  { value: "RESOLVED", label: "已解决" },
];

interface RequestWithRelations {
  id: string;
  title: string;
  description: string;
  category: string;
  reward: number;
  status: string;
  createdAt: string;
  author: { id: string; name: string; avatar?: string | null };
  responses: { id: string }[];
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("全部");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== "全部") params.set("category", category);
      if (status) params.set("status", status);

      const res = await fetch(`/api/requests?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
      setLoading(false);
    }
    fetchRequests();
  }, [category, status]);

  const filtered = requests.filter((r) =>
    search ? r.title.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">求助大厅</h1>
        <Button asChild>
          <Link href="/requests/new" className="gap-2">
            <Plus className="h-4 w-4" />
            发布求助
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="搜索求助..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 rounded-md border bg-background text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              category === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:border-primary/50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>暂无求助</p>
          <Button variant="link" asChild className="mt-2">
            <Link href="/requests/new">发布第一个求助</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((req) => (
            <RequestCard
              key={req.id}
              id={req.id}
              title={req.title}
              description={req.description}
              category={req.category}
              reward={req.reward}
              status={req.status}
              createdAt={req.createdAt}
              author={req.author}
              responseCount={req.responses.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
