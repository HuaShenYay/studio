'use client';
import { useState, useEffect } from 'react';
import { BookOpen, BrainCircuit, Loader2 } from 'lucide-react';
import { generateFillInBlankExercises } from '@/ai/flows/generate-fill-in-blank';
import type { LiteraryTerm } from '@/types';
import TermInputForm from '@/components/TermInputForm';
import PracticeSession from '@/components/PracticeSession';
import { useToast } from "@/hooks/use-toast";

const initialTerms: Omit<LiteraryTerm, 'id' | 'exercise' | 'answer' | 'isDifficult' | 'status' | 'userAnswer'>[] = [
    {
        term: '隐喻',
        explanation: '一种修辞手法，将一个词或短语应用于其不适用的对象或行为上。',
    },
    {
        term: '头韵',
        explanation: '指相邻或相近的词语开头使用相同字母或发音的现象。',
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
                        title: "生成练习时出错",
                        description: `无法为“${initialTerm.term}”生成练习。请重试。`,
                    })
                }
            }
            setTerms(processedTerms);
            setIsLoading(false);
        };
        initializeTerms();
    }, [toast]);

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
              title: "术语已添加！",
              description: `已成功为“${term}”创建练习。`,
            })
        } catch (error) {
            console.error('Failed to add term:', error);
            toast({
                variant: "destructive",
                title: "出错了",
                description: "生成练习失败。请检查您的网络连接或稍后重试。",
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
        <div className="min-h-screen w-full bg-background">
            <main className="container mx-auto px-4 py-8 md:py-16">
                <header className="text-center mb-16">
                    <div className="inline-flex items-center gap-4 p-4 rounded-full bg-primary/10">
                        <div className="p-3 rounded-full bg-primary text-primary-foreground">
                            <BookOpen className="h-8 w-8" />
                        </div>
                         <h1 className="text-4xl md:text-5xl font-bold text-primary">
                            文词通
                        </h1>
                    </div>
                    <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
                        您的个人文学术语备考助手。在这里添加术语，然后通过自动生成的填空题进行练习。
                    </p>
                </header>
                
                <div className="max-w-3xl mx-auto grid grid-cols-1 gap-16">
                    <TermInputForm onAddTerm={handleAddTerm} isLoading={isLoading} />

                    <section>
                         <div className="flex items-center gap-4 mb-8">
                             <div className="p-3 rounded-full bg-primary/10 text-primary">
                                <BrainCircuit className="h-8 w-8" />
                             </div>
                             <h2 className="text-3xl font-bold text-foreground">练习模式</h2>
                         </div>
                        {isLoading && terms.length === 0 ? (
                           <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground py-12 rounded-xl bg-card">
                               <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                               <p className="text-lg">正在为您准备初次练习...</p>
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
