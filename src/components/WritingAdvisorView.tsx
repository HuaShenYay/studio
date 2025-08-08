"use client";

import React from 'react';
import { Feather } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function WritingAdvisorView() {
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
                    <CardTitle>功能维护中</CardTitle>
                    <CardDescription>
                        我们正在紧急修复此功能。对于给您带来的不便，我们深表歉意。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <p>请稍后再试。</p>
                </CardContent>
            </Card>
        </div>
    );
}
