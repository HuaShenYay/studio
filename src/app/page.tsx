'use client';
import { useState, useEffect } from 'react';
import { BookOpen, BrainCircuit, Loader2 } from 'lucide-react';
import { generateFillInBlankExercises } from '@/ai/flows/generate-fill-in-blank';
import type { LiteraryTerm } from '@/types';
import TermInputForm from '@/components/TermInputForm';
import PracticeSession from '@/components/PracticeSession';
import { useToast } from "@/hooks/use-toast"

const initialTerms: Omit<LiteraryTerm, 'id' | 'exercise' | 'answer' | 'isDifficult' | 'status' | 'userAnswer'>[] = [
    {
        term: 'Metaphor',
        explanation: 'A figure of speech in which a word or phrase is applied to an object or action to which it is not literally applicable.',
    },
    {
        term: 'Alliteration',
        explanation: 'The occurrence of the same letter or sound at the beginning of adjacent or closely connected words.',
    }
];

export default function Home() {
    const [terms, setTerms] = useState<LiteraryTerm[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const initializeTerms = async () => {
            setIsLoading(true);
            const processedTerms: LiteraryTerm[] = [];
            for (const initialTerm of initialTerms) {
                try {
                    const result = await generateFillInBlankExercises({
                        term: initialTerm.term,
                        explanation: initialTerm.explanation,
                    });
                    processedTerms.push({
                        ...initialTerm,
                        id: crypto.randomUUID(),
                        exercise: result.exercise,
                        answer: initialTerm.term,
                        isDifficult: false,
                        status: 'unanswered',
                        userAnswer: '',
                    });
                } catch (error) {
                    console.error('Failed to generate exercise for', initialTerm.term, error);
                     toast({
                        variant: "destructive",
                        title: "Error Generating Exercise",
                        description: `Could not generate an exercise for "${initialTerm.term}". Please try again.`,
                    })
                }
            }
            setTerms(processedTerms);
            setIsLoading(false);
        };
        initializeTerms();
    }, []);

    const handleAddTerm = async (term: string, explanation: string) => {
        setIsLoading(true);
        try {
            const result = await generateFillInBlankExercises({ term, explanation });
            const newTerm: LiteraryTerm = {
                id: crypto.randomUUID(),
                term,
                explanation,
                exercise: result.exercise,
                answer: term,
                isDifficult: false,
                status: 'unanswered',
                userAnswer: '',
            };
            setTerms((prevTerms) => [newTerm, ...prevTerms]);
            toast({
              title: "Term Added!",
              description: `Successfully created an exercise for "${term}".`,
            })
        } catch (error) {
            console.error('Failed to add term:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to generate an exercise. Please check your connection or try again later.",
            })
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateTerm = (updatedTerm: LiteraryTerm) => {
        setTerms((prevTerms) =>
            prevTerms.map((t) => (t.id === updatedTerm.id ? updatedTerm : t))
        );
    };

    return (
        <div className="min-h-screen w-full">
            <main className="container mx-auto px-4 py-8 md:py-12">
                <header className="text-center mb-12">
                    <div className="inline-flex items-center gap-3">
                        <BookOpen className="h-10 w-10 text-primary" />
                        <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
                            LexiPrep
                        </h1>
                    </div>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Your personal assistant for mastering literary terminology.
                    </p>
                </header>
                
                <div className="max-w-4xl mx-auto grid grid-cols-1 gap-12">
                    <TermInputForm onAddTerm={handleAddTerm} isLoading={isLoading} />

                    <section>
                         <div className="flex items-center gap-3 mb-6">
                             <BrainCircuit className="h-8 w-8 text-primary" />
                             <h2 className="font-headline text-3xl font-semibold text-foreground">Practice Session</h2>
                         </div>
                        {isLoading && terms.length === 0 ? (
                           <div className="flex justify-center items-center gap-3 text-muted-foreground py-10">
                               <Loader2 className="h-6 w-6 animate-spin"/>
                               <p>Preparing your first exercises...</p>
                           </div>
                        ) : (
                           <PracticeSession terms={terms} onUpdateTerm={handleUpdateTerm} />
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
