import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Coins, Clock } from "lucide-react";

interface RequestCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  reward: number;
  status: string;
  createdAt: string | Date;
  author: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  responseCount?: number;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  OPEN: { label: "待解答", variant: "default" },
  IN_PROGRESS: { label: "解答中", variant: "secondary" },
  RESOLVED: { label: "已解决", variant: "outline" },
  CLOSED: { label: "已关闭", variant: "destructive" },
};

const categoryColors: Record<string, string> = {
  "环境配置": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  "报错调试": "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  "代码理解": "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  "UI设计": "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  "其他": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function RequestCard({
  id,
  title,
  description,
  category,
  reward,
  status,
  createdAt,
  author,
  responseCount = 0,
}: RequestCardProps) {
  const statusInfo = statusMap[status] ?? { label: status, variant: "outline" as const };
  const categoryColor = categoryColors[category] ?? categoryColors["其他"];
  const date = new Date(createdAt).toLocaleDateString("zh-CN");

  return (
    <Link href={`/requests/${id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base line-clamp-2 flex-1">{title}</h3>
            <Badge variant={statusInfo.variant} className="shrink-0 text-xs">
              {statusInfo.label}
            </Badge>
          </div>
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full w-fit font-medium ${categoryColor}`}>
            {category}
          </span>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </CardContent>
        <CardFooter className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Coins className="h-3.5 w-3.5 text-yellow-500" />
              <span className="font-medium text-yellow-600 dark:text-yellow-400">{reward} 积分</span>
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {responseCount}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {date}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-xs">
                {author.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{author.name}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
