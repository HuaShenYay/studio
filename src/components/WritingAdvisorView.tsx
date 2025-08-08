"use client";

import React, { useState } from 'react';
import { Feather, Loader2, Sparkles, BookText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import InteractiveCritique from '@/components/InteractiveCritique';
import { critiqueWriting } from '@/ai/flows/critique-writing';
import type { CritiqueWritingOutput, LiteraryStyle } from '@/ai/flows/critique-writing';
import { useToast } from '@/hooks/use-toast';

// This list must match the one in the Zod schema in the AI flow.
const literaryStyles: LiteraryStyle[] = ["海明威极简主义", "现实主义", "浪漫主义", "象征主义", "意识流", "超现实主义", "未来主义", "结构主义", "新批评", "精神分析"];

export default function WritingAdvisorView() {
    const [text, setText] = useState('他独自坐在窗边，雨水敲打着玻璃，像无数个微小的、无法破译的密码。街灯的光晕在湿漉漉的柏油路上拉得很长，偶尔有车驶过，灯光会短暂地照亮他苍白的脸。他没有开灯，任由自己沉浸在黑暗与光影的交界处。桌上的咖啡已经冷了，就像他此刻的心情。他拿起笔，想写点什么，却又不知从何说起。那些未曾说出口的话，未曾实现的梦，此刻都像这窗外的雨一样，密集而又冰冷。');
    const [style, setStyle] = useState<LiteraryStyle>('现实主义');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CritiqueWritingOutput | null>(null);
    const { toast } = useToast();

    const handleCritique = async () => {
        setLoading(true);
        setResult(null);
        try {
            const response = await critiqueWriting({
                textToCritique: text,
                style: style,
            });
            setResult(response);
        } catch (e: any) {
            toast({
                variant: 'destructive',
                title: '生成评价失败',
                description: e?.message || '请稍后再试，或检查输入内容。',
            });
        } finally {
            setLoading(false);
        }
    };
    
    // Helper function to determine progress bar color based on score
    const getScoreColorClass = (score: number) => {
        if (score < 40) return 'progress-bar-red';
        if (score < 70) return 'progress-bar-yellow';
        return 'progress-bar-green';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
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
                    <CardTitle className="flex items-center gap-2"><BookText className="h-5 w-5" />文本分析与评价</CardTitle>
                    <CardDescription>输入您的作品，选择一种批评视角，AI 将为您提供多维度的评价和具体的修改建议。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Textarea 
                            value={text} 
                            onChange={(e) => setText(e.target.value)} 
                            className="md:col-span-3 min-h-[200px]"
                            placeholder="请在此处粘贴您的作品..."
                        />
                        <div className="space-y-4 md:col-span-1">
                            <Select onValueChange={(v) => setStyle(v as LiteraryStyle)} defaultValue={style}>
                                <SelectTrigger>
                                    <SelectValue placeholder="请选择一个批评视角" />
                                </SelectTrigger>
                                <SelectContent>
                                    {literaryStyles.map(s => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleCritique} disabled={loading || !text} className="w-full">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                                {loading ? '正在分析...' : '生成评价'}
                            </Button>
                        </div>
                    </div>
                    {result && (
                        <div className="space-y-6 pt-6">
                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-foreground">综合评价</h3>
                                <div className="space-y-4">
                                    {Object.entries(result.evaluation).map(([key, value]) => (
                                        <div key={key}>
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className="text-sm font-medium text-muted-foreground capitalize">
                                                    {key.replace(/([A-Z])/g, ' $1').replace('And', '&')}
                                                </span>
                                                <span className="text-lg font-bold text-primary">{value.score}</span>
                                            </div>
                                            <Progress value={value.score} indicatorClassName={getScoreColorClass(value.score)} />
                                            <p className="text-sm text-muted-foreground mt-2">{value.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-foreground">交互式修改建议</h3>
                                <Card className="p-4 bg-muted/30">
                                  <InteractiveCritique originalText={text} suggestions={result.suggestions} />
                                </Card>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}