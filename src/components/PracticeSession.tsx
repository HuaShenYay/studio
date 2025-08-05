"use client";

import type { LiteraryTerm } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExerciseCard from "@/components/ExerciseCard";

type PracticeSessionProps = {
    terms: LiteraryTerm[];
    onUpdateTerm: (term: LiteraryTerm) => void;
}

export default function PracticeSession({ terms, onUpdateTerm }: PracticeSessionProps) {
    const reviewTerms = terms.filter(term => term.isDifficult);

    return (
        <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card">
                <TabsTrigger value="all">全部术语 ({terms.length})</TabsTrigger>
                <TabsTrigger value="review">复习列表 ({reviewTerms.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
                {terms.length > 0 ? (
                    <div className="space-y-4">
                        {terms.map(term => (
                            <ExerciseCard key={term.id} termData={term} onUpdate={onUpdateTerm} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p>还没有术语。请在上方添加一个以开始！</p>
                    </div>
                )}
            </TabsContent>
            <TabsContent value="review" className="mt-6">
                {reviewTerms.length > 0 ? (
                    <div className="space-y-4">
                        {reviewTerms.map(term => (
                            <ExerciseCard key={term.id} termData={term} onUpdate={onUpdateTerm} />
                        ))}
                    </div>
                ) : (
                     <div className="text-center text-muted-foreground py-10">
                        <p>您的复习列表中没有术语。</p>
                        <p className="text-sm">用星标标记一个术语以将其添加到此处。</p>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    )
}
