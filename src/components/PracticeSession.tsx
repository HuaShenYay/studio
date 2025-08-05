"use client";

import type { LiteraryTerm } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExerciseCard from "@/components/ExerciseCard";
import { BrainCircuit } from 'lucide-react';

type PracticeSessionProps = {
    terms: LiteraryTerm[];
    onUpdateTerm: (term: LiteraryTerm) => void;
    onDeleteTerm: (id: number) => void;
}

export default function PracticeSession({ terms, onUpdateTerm, onDeleteTerm }: PracticeSessionProps) {
    const reviewTerms = terms.filter(term => term.isDifficult);

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6 px-1">
                 <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <BrainCircuit className="h-8 w-8" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold text-foreground">练习模式</h2>
                    <p className="text-muted-foreground">通过自动生成的填空题进行练习。</p>
                 </div>
            </div>
            <Tabs defaultValue="all" className="w-full flex-grow">
                <TabsList className="grid w-full grid-cols-2 bg-primary/10 p-1 h-auto">
                    <TabsTrigger value="all" className="py-2 data-[state=active]:bg-background data-[state=active]:text-foreground">全部术语 ({terms.length})</TabsTrigger>
                    <TabsTrigger value="review" className="py-2 data-[state=active]:bg-background data-[state=active]:text-foreground">复习列表 ({reviewTerms.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-6">
                    {terms.length > 0 ? (
                        <div className="space-y-4">
                            {terms.map(term => (
                                <ExerciseCard key={term.id} termData={term} onUpdate={onUpdateTerm} onDelete={onDeleteTerm} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-12 rounded-xl bg-card">
                            <p className="text-lg">还没有术语。</p>
                            <p>请在上方添加一个以开始！</p>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="review" className="mt-6">
                    {reviewTerms.length > 0 ? (
                        <div className="space-y-4">
                            {reviewTerms.map(term => (
                                <ExerciseCard key={term.id} termData={term} onUpdate={onUpdateTerm} onDelete={onDeleteTerm} />
                            ))}
                        </div>
                    ) : (
                         <div className="text-center text-muted-foreground py-12 rounded-xl bg-card">
                            <p className="text-lg">您的复习列表中没有术语。</p>
                            <p className="text-sm">用星标标记一个术语以将其添加到此处。</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}