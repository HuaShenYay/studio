
"use client";

import { BrainCircuit, Feather, FileText, Bot, Rocket } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const features = [
    {
        icon: <BrainCircuit className="h-16 w-16 md:h-24 md:w-24 text-primary" />,
        title: "FSRS 记忆算法",
        description: "应用内置先进的 FSRS 间隔重复算法，它能根据您的评分（Again/Hard/Good/Easy）动态计算出每个术语的最佳复习时间。这不仅仅是简单的重复，而是为了将知识转化为长期记忆的科学方法，确保您在考前达到记忆的巅峰状态。",
        align: "left"
    },
    {
        icon: <Bot className="h-16 w-16 md:h-24 md:w-24 text-primary" />,
        title: "Gemini AI 强力驱动",
        description: "搭载 Google 最新一代 Gemini-2.5-Flash 模型，我们为您提供的不只是简单的术语解释。无论是生成高度仿真的填空练习，还是提供富有洞见的写作评价，AI 都能理解您的意图，成为您最智能、最可靠的备考伙伴。",
        align: "right"
    },
    {
        icon: <Feather className="h-16 w-16 md:h-24 md:w-24 text-primary" />,
        title: "全能写作指导",
        description: "从宏观的评论大纲、论述题思路，到微观的文本段落修改建议，AI 都能提供多维度、交互式的评价。您的作品不再是孤立的文字，而是在与专业 AI 编辑的对话中不断被打磨、提升，最终成为一篇出色的文章。",
        align: "left"
    },
     {
        icon: <Rocket className="h-16 w-16 md:h-24 md:w-24 text-primary" />,
        title: "沉浸式学习体验",
        description: "我们相信，学习不应被割裂。通过“就地挖空”技术，练习与原文保持一致，让您在完整的语境中进行思考。在学习模式下，您可以自由地管理术语、编辑内容、调整分组，打造完全属于您自己的、高效的备考资料库。",
        align: "right"
    },
];

const TypingEffect = ({ text, className }: { text: string, className?: string }) => {
    const [displayedText, setDisplayedText] = useState('');

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
        }, 120);
        return () => clearInterval(intervalId);
    }, [text]);

    return <span className={cn(className)}>{displayedText}</span>;
};

const FeatureSection = ({ icon, title, description, align }: typeof features[0]) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.1,
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);
    
    const content = (
        <>
            <div className={cn("md:w-1/2 flex justify-center p-8", align === 'right' && 'md:order-last')}>
                 <div className={cn(
                    "transition-all duration-1000 transform",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                )}>
                    {icon}
                </div>
            </div>
            <div className="md:w-1/2 p-8 flex flex-col justify-center">
                 <div className={cn(
                    "transition-all duration-1000 delay-300 transform",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                )}>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        {description}
                    </p>
                 </div>
            </div>
        </>
    );

    return (
        <section ref={ref} className="container mx-auto py-12 md:py-24">
            <div className={cn("flex flex-col md:flex-row items-center", align === 'right' ? 'md:flex-row-reverse' : '')}>
               {content}
            </div>
        </section>
    );
};


export default function AboutView() {
    return (
        <div className="w-full bg-background overflow-hidden">
            <section className="text-center py-24 md:py-32 bg-card/50">
                <div className="container mx-auto">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-primary">
                        大记怒文
                    </h1>
                     <p className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto h-8">
                       <TypingEffect text="您的个人文学术语备考助手" />
                     </p>
                </div>
            </section>

            <div className='space-y-8'>
                {features.map((feature, index) => (
                    <FeatureSection key={index} {...feature} />
                ))}
            </div>

            <section className="text-center py-24 md:py-32 bg-card/50">
                <div className="container mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
                        即刻开始, 精通文词
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        切换到“学习模式”或“今日到期”视图，开启您的高效备考之旅。
                    </p>
                </div>
            </section>
            
            <footer className="text-center py-12">
                <div className="container mx-auto">
                    <p className="text-muted-foreground">Meso/HSY制作</p>
                    <p className="text-muted-foreground">B站：癔症Hysteria</p>
                </div>
            </footer>
        </div>
    );
}
