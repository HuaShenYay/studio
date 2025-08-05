"use client";
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wand2, Loader2, Feather, Brain, Image as ImageIcon, ScanText } from "lucide-react";
import { analyzeText } from "@/ai/flows/analyze-text";
import type { AnalyzeTextOutput } from "@/ai/flows/analyze-text";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import AnalysisResultCard from './AnalysisResultCard';

const formSchema = z.object({
  text: z.string().min(50, {
    message: "文本必须至少包含 50 个字符。",
  }).max(5000, {
      message: "文本不能超过 5000 个字符。"
  }),
});

export default function TextAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeTextOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeText({ text: values.text });
      setAnalysisResult(result);
      toast({
        title: "分析完成！",
        description: "AI 已成功分析您提供的文本。",
      });
    } catch (error) {
      console.error("Failed to analyze text:", error);
      toast({
        variant: "destructive",
        title: "分析时出错",
        description: "无法分析文本。请稍后重试。",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
           <div className="p-3 rounded-full bg-primary/10 text-primary">
              <ScanText className="h-8 w-8" />
           </div>
           <div>
              <h2 className="text-3xl font-bold text-foreground">文本分析</h2>
              <p className="text-muted-foreground">粘贴一段文本，让 AI 为您深入解读。</p>
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
                      placeholder="在此处粘贴您想分析的文学文本段落..."
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
              开始分析
            </Button>
          </form>
        </Form>

        {isLoading && (
           <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground py-12 rounded-xl bg-card mt-6">
               <Loader2 className="h-8 w-8 animate-spin text-primary"/>
               <p className="text-lg">AI 正在努力分析中，请稍候...</p>
           </div>
        )}

        {analysisResult && (
          <div className="mt-8 space-y-4">
            <AnalysisResultCard 
                title="主题思想" 
                content={analysisResult.theme}
                icon={<Brain className="h-5 w-5 text-blue-500" />}
                colorClass="border-blue-500"
            />
            <AnalysisResultCard 
                title="写作手法" 
                content={analysisResult.technique}
                icon={<Feather className="h-5 w-5 text-green-500" />}
                colorClass="border-green-500"
            />
            <AnalysisResultCard 
                title="关键意象" 
                content={analysisResult.imagery}
                icon={<ImageIcon className="h-5 w-5 text-purple-500" />}
                colorClass="border-purple-500"
            />
          </div>
        )}
    </div>
  );
}
