"use client";
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lightbulb, Loader2, Wand2, AlertTriangle, CheckCircle } from "lucide-react";
import { detectProblems } from "@/ai/flows/detect-problems";
import type { DetectProblemsOutput } from "@/ai/flows/detect-problems";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from '@/lib/utils';

const formSchema = z.object({
  text: z.string().min(20, {
    message: "文本必须至少包含 20 个字符。",
  }).max(5000, {
      message: "文本不能超过 5000 个字符。"
  }),
});

export default function ProblemDetection() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DetectProblemsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setResult(null);
    try {
      const detectionResult = await detectProblems({ text: values.text });
      setResult(detectionResult);
      toast({
        title: "检测完成！",
        description: `AI 在您的文本中发现了 ${detectionResult.problems.length} 个潜在问题。`,
      });
    } catch (error) {
      console.error("Failed to detect problems:", error);
      toast({
        variant: "destructive",
        title: "检测时出错",
        description: "无法检测文本中的问题。请稍后重试。",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
           <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Lightbulb className="h-8 w-8" />
           </div>
           <div>
              <h2 className="text-3xl font-bold text-foreground">问题检测</h2>
              <p className="text-muted-foreground">让 AI 检查您的文本，发现潜在的错误和改进点。</p>
           </div>
       </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="在此处粘贴您想检查的文本..."
                      className="resize-y text-base"
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} size="lg" className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              开始检测
            </Button>
          </form>
        </Form>

        {isLoading && (
           <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground py-12 rounded-xl bg-card mt-6">
               <Loader2 className="h-8 w-8 animate-spin text-primary"/>
               <p className="text-lg">AI 正在仔细检查您的文本，请稍候...</p>
           </div>
        )}

        {result && (
          <div className="mt-8">
            {result.problems.length > 0 ? (
                <div className="space-y-4">
                    {result.problems.map((item, index) => (
                        <Card key={index} className="border-l-4 border-yellow-500">
                            <CardHeader>
                                <CardTitle className="flex items-start gap-3 text-lg">
                                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />
                                    <span>{item.problem}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground pl-8">{item.suggestion}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-l-4 border-green-500">
                    <CardHeader className="flex flex-row items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        <CardTitle className="text-xl">未发现问题！</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <p className="text-muted-foreground pl-10">AI 没有在您的文本中发现明显的错误或可以改进的地方。做得很好！</p>
                    </CardContent>
                </Card>
            )}
          </div>
        )}
    </div>
  );
}
