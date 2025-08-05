"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnalysisResultCardProps {
  title: string;
  content: string;
  icon: React.ReactNode;
  colorClass: string;
}

export default function AnalysisResultCard({ title, content, icon, colorClass }: AnalysisResultCardProps) {
  return (
    <Card className={cn("border-l-4", colorClass)}>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
        <div className={cn("p-2 rounded-md", colorClass.replace('border-', 'bg-').replace(/-\d+$/, '/10'))}>
            {icon}
        </div>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{content}</p>
      </CardContent>
    </Card>
  );
}
