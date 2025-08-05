// @/components/Header.tsx
"use client";

import React from 'react';
import { BookOpen, NotebookTabs, PlusSquare, ScanText, LogOut, Search, Lightbulb } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';

type View = 'practice' | 'add' | 'analysis' | 'detection';

interface HeaderProps {
    currentView: View;
    setCurrentView: (view: View) => void;
    onLogout: () => void;
}

const navItems: { view: View, label: string, icon: React.ElementType }[] = [
    { view: 'practice', label: '练习模式', icon: NotebookTabs },
    { view: 'add', label: '添加术语', icon: PlusSquare },
    { view: 'analysis', label: '文本分析', icon: ScanText },
    { view: 'detection', label: '问题检测', icon: Lightbulb },
];

export default function Header({ currentView, setCurrentView, onLogout }: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center">
                <div className="mr-4 flex items-center">
                    <BookOpen className="h-6 w-6 mr-3 text-primary" />
                    <span className="font-bold text-lg text-primary">文词通</span>
                </div>
                <div className="flex flex-1 items-center justify-end space-x-2">
                    <TooltipProvider>
                        {navItems.map((item) => (
                             <Tooltip key={item.view}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setCurrentView(item.view)}
                                        className={cn(
                                            "rounded-full h-10 w-10",
                                            currentView === item.view && "bg-primary/10 text-primary"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span className="sr-only">{item.label}</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{item.label}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onLogout}
                                    className="rounded-full h-10 w-10"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span className="sr-only">登出</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>登出</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </header>
    );
}
