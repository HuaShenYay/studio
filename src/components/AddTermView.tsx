"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PlusCircle, Loader2, Sparkles, PlusSquare, Upload, FileText } from "lucide-react";
import { useState, useCallback } from "react";
import { generateExplanation } from "@/ai/flows/generate-explanation";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from 'react-dropzone';

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
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";

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
    })
});

type AddTermViewProps = {
    onAddTerm: (term: string, explanation: string) => Promise<void>;
    onPdfUpload: (pdfContent: string) => Promise<void>;
    isLoading: boolean;
}

export default function AddTermView({ onAddTerm, onPdfUpload, isLoading }: AddTermViewProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();
    const [fileName, setFileName] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = async (event) => {
                if (event.target?.result) {
                    try {
                        const pdf = (await import('pdf-parse')).default;
                        const data = await pdf(event.target.result as ArrayBuffer);
                        onPdfUpload(data.text);
                    } catch (error) {
                        console.error("Failed to parse PDF", error);
                        toast({ variant: "destructive", title: "PDF解析失败", description: "无法读取文件内容。" });
                        setFileName(null);
                    }
                }
            };
            reader.readAsArrayBuffer(file);
        }
    }, [onPdfUpload, toast]);


    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        disabled: isLoading,
    });


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            term: "",
            explanation: "",
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
        await onAddTerm(values.term, values.explanation);
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
                    <p className="text-muted-foreground">手动输入或从PDF批量导入，AI将自动生成练习。</p>
                </div>
            </div>

            <Card className="mb-8">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">从 PDF 批量导入</h3>
                    <div {...getRootProps()} className={`flex justify-center items-center w-full px-6 py-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'} ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}>
                        <input {...getInputProps()} />
                        <div className="text-center">
                            {isLoading ? (
                               <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                                    <p className="mt-4 text-sm text-primary font-semibold">AI 正在处理您的文档...</p>
                                    <p className="text-xs text-muted-foreground mt-1">请稍候，这可能需要一点时间</p>
                                </div>
                            ) : (
                                <>
                                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                    {fileName ? (
                                        <div className="mt-4 flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-primary" />
                                            <p className="font-semibold text-primary">{fileName}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="mt-4 text-sm text-muted-foreground">
                                                <span className="font-semibold text-primary">点击上传</span> 或拖拽文件到此
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">仅支持PDF文件</p>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center my-6">
                <Separator className="flex-grow" />
                <span className="mx-4 text-muted-foreground text-sm">或</span>
                <Separator className="flex-grow" />
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
