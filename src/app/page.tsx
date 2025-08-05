'use client';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { generateFillInBlankExercises } from '@/ai/flows/generate-fill-in-blank';
import type { LiteraryTerm } from '@/types';
import TermInputForm from '@/components/TermInputForm';
import PracticeSession from '@/components/PracticeSession';
import TextAnalysis from '@/components/TextAnalysis';
import { useToast } from "@/hooks/use-toast";
import AppLayout from '@/components/AppLayout';

type View = 'practice' | 'add' | 'analysis';

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
    const [isAddingTerm, setIsAddingTerm] = useState(false);
    const [currentView, setCurrentView] = useState<View>('practice');
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
        setIsAddingTerm(true);
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
            setCurrentView('practice');
        } catch (error) {
            console.error('Failed to add term:', error);
            toast({
                variant: "destructive",
                title: "出错了",
                description: "生成练习失败。请检查您的网络连接或稍后重试。",
            })
        } finally {
            setIsAddingTerm(false);
        }
    };

    const handleUpdateTerm = (updatedTerm: LiteraryTerm) => {
        setTerms((prevTerms) =>
            prevTerms.map((t) => (t.id === updatedTerm.id ? updatedTerm : t))
        );
    };

    const renderContent = () => {
        if (isLoading && terms.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground py-12 rounded-xl bg-card h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                    <p className="text-lg">正在为您准备初次练习...</p>
                </div>
            );
        }

        switch (currentView) {
            case 'practice':
                return <PracticeSession terms={terms} onUpdateTerm={handleUpdateTerm} />;
            case 'add':
                return <TermInputForm onAddTerm={handleAddTerm} isLoading={isAddingTerm} />;
            case 'analysis':
                return <TextAnalysis />;
        }
    }

    return (
        <AppLayout currentView={currentView} setCurrentView={setCurrentView}>
            {renderContent()}
        </AppLayout>
    );
}
