
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Feather, Loader2, Wand2, BotMessageSquare, BookCheck, ChevronsRight, Drama, BrainCircuit, Rocket } from "lucide-react";
import { useState } from "react";
import { critiqueWriting } from "@/ai/flows/critique-writing";
import type { CritiqueWritingOutput, LiteraryStyle } from "@/ai/flows/critique-writing";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import InteractiveCritique from "./InteractiveCritique";

const literaryStyles = ["海明威极简主义", "现实主义", "浪漫主义", "象征主义", "意识流", "超现实主义", "未来主义", "结构主义", "新批评", "精神分析"] as const;

const formSchema = z.object({
    textToCritique: z.string().min(50, {
        message: "为了得到有意义的建议，请输入至少 50 个字符。",
    }).max(5000, {
        message: "内容过长，请保持在 5000 字符以内。"
    }),
    style: z.enum(literaryStyles, {
        errorMap: () => ({ message: "请选择一个文学风格或批评方法。" }),
    }),
});

export default function WritingAdvisorView() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<CritiqueWritingOutput | null>(null);
    const [originalText, setOriginalText] = useState("");
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            textToCritique: "",
            style: "现实主义",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setResult(null);
        setOriginalText(values.textToCritique);
        try {
            const critiqueResult = await critiqueWriting({
                textToCritique: values.textToCritique,
                style: values.style,
            });
            setResult(critiqueResult);
        } catch (error) {
            console.error("Failed to get writing critique:", error);
            const errorMessage = error instanceof Error ? error.message : '一个未知错误发生了。';
            toast({
                variant: "destructive",
                title: "获取建议时出错",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Feather className="h-8 w-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-foreground">写作指导</h2>
                    <p className="text-muted-foreground">让 AI 成为您的专属文学编辑，提升您的写作技巧。</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>输入您的作品</CardTitle>
                    <CardDescription>将您的文字粘贴到下方，然后选择一种分析视角。</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="textToCritique"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea
                                                placeholder="在此处粘贴您的文字..."
                                                className="resize-y min-h-[200px] text-base"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <FormField
                                    control={form.control}
                                    name="style"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>选择分析视角</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="请选择一个视角" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {literaryStyles.map(style => (
                                                        <SelectItem key={style} value={style}>{style}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                            AI 将依据您选择的批评理论对您的作品进行评价。
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <Button type="submit" disabled={isLoading} size="lg" className="w-full">
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                    获取 AI 建议
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {isLoading && (
                 <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground py-12 rounded-xl bg-card mt-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-lg">AI 正在阅读您的作品并撰写反馈...</p>
                    <p className="text-sm">这可能需要一点时间，请稍候。</p>
                </div>
            )}

            {result && !isLoading && (
                <div className="mt-8 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">具体修改建议</CardTitle>
                            <CardDescription>将鼠标悬浮于高亮文本上，即可查看详细修改建议及理由。</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <InteractiveCritique
                                originalText={originalText}
                                suggestions={result.suggestions}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                             <CardTitle className="text-2xl">综合评价报告</CardTitle>
                             <CardDescription>AI 已从六个维度对您的作品进行了量化分析和评价。</CardDescription>
                        </Header>
                        <CardContent className="space-y-6 pt-2">
                             {[
                                { title: '主题与立意', data: result.evaluation.themeAndIntention, icon: BotMessageSquare },
                                { title: '结构与逻辑', data: result.evaluation.structureAndLogic, icon: ChevronsRight },
                                { title: '语言与表达', data: result.evaluation.languageAndExpression, icon: BookCheck },
                                { title: '人物与形象', data: result.evaluation.charactersAndImagery, icon: Drama },
                                { title: '情节与节奏', data: result.evaluation.plotAndPacing, icon: BrainCircuit },
                                { title: '创新性与独特性', data: result.evaluation.innovationAndUniqueness, icon: Rocket },
                             ].map((module) => (
                                <div key={module.title} className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2 py-4 border-b last:border-b-0">
                                    <div className="md:col-span-1">
                                        <h4 className="font-semibold text-lg flex items-center gap-2 mb-2">
                                            <module.icon className="h-5 w-5 text-primary" />
                                            {module.title}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <Progress 
                                                value={module.data.score} 
                                                className="h-3"
                                                indicatorClassName={cn({
                                                    'bg-red-500': module.data.score < 40,
                                                    'bg-yellow-500': module.data.score >= 40 && module.data.score < 70,
                                                    'bg-green-500': module.data.score >= 70,
                                                })}
                                            />
                                            <span className="font-bold text-lg w-12 text-right">{module.data.score}</span>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 text-muted-foreground">
                                        <p className="text-base whitespace-pre-wrap leading-relaxed">{module.data.comment}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
