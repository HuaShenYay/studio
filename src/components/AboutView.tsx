
"use client";

import { BrainCircuit, Feather, FileText, Bot } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const features = [
    {
        icon: <BrainCircuit className="h-8 w-8 text-primary" />,
        title: "FSRS 记忆算法",
        description: "基于评分（Again/Hard/Good/Easy）动态安排复习，平衡记忆稳定度与学习效率，实现高效记忆。",
    },
    {
        icon: <Bot className="h-8 w-8 text-primary" />,
        title: "Gemini AI 驱动",
        description: "由新一代 Gemini-2.5-Flash 模型提供支持，为您生成专业的术语解释、写作建议和每日作品选读。",
    },
    {
        icon: <FileText className="h-8 w-8 text-primary" />,
        title: "沉浸式学习体验",
        description: "直接在原文中“就地挖空”，保持文本一致性。在学习模式下，您可以集中管理术语与分组。",
    },
    {
        icon: <Feather className="h-8 w-8 text-primary" />,
        title: "全能写作指导",
        description: "提供从评论大纲、论述题思路到具体文本的多维度、交互式 AI 写作评价与修改建议。",
    },
];

const TypingEffect = ({ text, className }: { text: string, className?: string }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [cursorVisible, setCursorVisible] = useState(true);

    useEffect(() => {
        setDisplayedText('');
        let i = 0;
        const intervalId = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(text.substring(0, i + 1));
                i++;
            } else {
                clearInterval(intervalId);
            }
        }, 100);
        return () => clearInterval(intervalId);
    }, [text]);

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setCursorVisible(v => !v);
        }, 500);
        return () => clearInterval(cursorInterval);
    }, []);

    return (
        <span className={cn(className)}>
            {displayedText}
            <span className={cn("transition-opacity duration-500", cursorVisible ? "opacity-100" : "opacity-0")}>|</span>
        </span>
    );
};


export default function AboutView() {
    return (
        <div className="w-full space-y-12">
            <section className="text-center py-12 bg-card rounded-2xl shadow-sm">
                <h1 className="text-5xl font-extrabold tracking-tight text-primary">
                    文词通
                </h1>
                <div className="mt-4 h-8">
                  <TypingEffect text="您的个人文学术语备考助手" className="text-xl text-muted-foreground" />
                </div>
            </section>

            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                        >
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-full">
                                    {feature.icon}
                                </div>
                                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}
