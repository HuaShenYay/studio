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
                <TabsTrigger value="all">All Terms ({terms.length})</TabsTrigger>
                <TabsTrigger value="review">Review List ({reviewTerms.length})</TabsTrigger>
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
                        <p>No terms yet. Add one above to get started!</p>
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
                        <p>No terms in your review list.</p>
                        <p className="text-sm">Mark a term with a star to add it here.</p>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    )
}
