"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PlusCircle, Loader2, Sparkles, PlusSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { generateExplanation } from "@/ai/flows/generate-explanation";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import type { TermGroup } from "@/types";

const formSchema = z.object({
    term: z.string().min(2, {
        message: "术语必须至少包含 2 个字符。",
    }).max(50, {
        message: "术语不能超过 50 个字符。"
    }),
    explanation: z.string().min(10, {
        message: "解释必须至少包含 10 个字符。"
    }).max(500, {
        message: "解释不能超过 500 个字符。"
    }),
    groupName: z.string().nullable(),
});

type AddTermViewProps = {
    onAddTerm: (term: string, explanation: string, groupName: string | null) => Promise<void>;
    isLoading: boolean;
    getGroups: () => Promise<TermGroup[]>;
}

export default function AddTermView({ onAddTerm, isLoading, getGroups }: AddTermViewProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [groups, setGroups] = useState<TermGroup[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const fetchedGroups = await getGroups();
                setGroups(fetchedGroups);
            } catch (error) {
                console.error("Failed to fetch groups:", error);
                toast({
                    variant: "destructive",
                    title: "加载小组失败",
                    description: "无法从服务器获取小组列表。",
                });
            }
        };
        fetchGroups();
    }, [getGroups, toast]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            term: "",
            explanation: "",
            groupName: "Manual",
        },
    });

    const handleGenerateExplanation = async () => {
        const term = form.getValues("term");
        if (!term) {
            form.setError("term", { message: "请先输入一个术语。" });
            return;
        }
        setIsGenerating(true);
        try {
            const result = await generateExplanation({ term });
            form.setValue("explanation", result.explanation, { shouldValidate: true });
            toast({
                title: "解释已生成！",
                description: "AI 已为您创建了解释。",
            });
        } catch (error) {
            console.error("Failed to generate explanation:", error);
            toast({
                variant: "destructive",
                title: "生成解释时出错",
                description: "无法生成解释。请稍后重试。",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        await onAddTerm(values.term, values.explanation, values.groupName);
        form.reset();
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <PlusSquare className="h-8 w-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-foreground">添加新术语</h2>
                    <p className="text-muted-foreground">手动输入一个术语，AI将自动为您生成练习。</p>
                </div>
            </div>

            <h3 className="text-lg font-semibold mb-4">手动添加单个术语</h3>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="term"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-lg">文学术语</FormLabel>
                                <FormControl>
                                    <Input placeholder="例如：十四行诗" {...field} className="text-base py-6" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="groupName"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel className="text-lg">分组</FormLabel>
                                <Combobox
                                    options={groups.map(g => ({ label: `${g.groupName} (${g.count})`, value: g.groupName }))}
                                    value={field.value ?? ""}
                                    onChange={field.onChange}
                                    entityName="分组"
                                />
                                <FormDescription>
                                   选择一个现有分组或输入一个新名称来创建分组。
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="explanation"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex justify-between items-center">
                                    <FormLabel className="text-lg">解释</FormLabel>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleGenerateExplanation}
                                        disabled={isGenerating || isLoading}
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                                        )}
                                        AI 生成解释
                                    </Button>
                                </div>
                                <FormControl>
                                    <Textarea
                                        placeholder="例如：一种由十四行组成的诗歌，使用多种正式的押韵格式..."
                                        className="resize-none text-base"
                                        rows={4}
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    我们的 AI 将据此创建一个填空题。
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isLoading} size="lg" className="w-full sm:w-auto">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                        生成练习并添加
                    </Button>
                </form>
            </Form>
        </div>
    );
}
