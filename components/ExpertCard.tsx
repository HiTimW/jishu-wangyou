import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2 } from "lucide-react";

interface ExpertCardProps {
  id: string;
  name: string;
  bio?: string | null;
  skills?: string | null;
  avatar?: string | null;
  responseCount: number;
}

export function ExpertCard({ id, name, bio, skills, avatar, responseCount }: ExpertCardProps) {
  const skillList = skills ? skills.split(",").map((s) => s.trim()).filter(Boolean) : [];

  return (
    <Link href={`/experts/${id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-lg font-semibold">
                {name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{name}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                <span>{responseCount} 次成功解答</span>
              </div>
            </div>
          </div>
        </CardHeader>
        {bio && (
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground line-clamp-2">{bio}</p>
          </CardContent>
        )}
        {skillList.length > 0 && (
          <CardFooter className="pt-2 flex flex-wrap gap-1.5">
            {skillList.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {skillList.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{skillList.length - 4}
              </Badge>
            )}
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
