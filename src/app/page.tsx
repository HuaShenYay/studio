'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { generateFillInBlankExercises } from '@/ai/flows/generate-fill-in-blank';
import type { LiteraryTerm, LiteraryTermCreate } from '@/types';
import AddTermView from '@/components/AddTermView';
import PracticeSession from '@/components/PracticeSession';
import { useToast } from "@/hooks/use-toast";
import AppLayout from '@/components/AppLayout';
import { addTerm, getTerms, updateTerm, deleteTerm, getGroups, resetAllTerms } from '@/services/terms-service';

type View = 'practice' | 'add';

function AuthWrapper({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const { toast } = useToast();

    const handleLogout = useCallback(() => {
        sessionStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
        router.push('/login');
    }, [router]);

    useEffect(() => {
        const performAuth = async () => {
            const loggedIn = searchParams.get('loggedin') === 'true';
            let sessionAuth = sessionStorage.getItem('isAuthenticated') === 'true';

            if (loggedIn) {
                sessionStorage.setItem('isAuthenticated', 'true');
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
                sessionAuth = true;
            }

            if (sessionAuth) {
                setIsAuthenticated(true);
                try {
                    // Reset all terms before fetching them
                    await resetAllTerms();
                    setIsReady(true);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : '一个未知错误发生了。';
                    toast({
                        variant: "destructive",
                        title: "重置练习失败",
                        description: `无法开始新的练习会话: ${errorMessage}`,
                    });
                    // Still show the app, but with potentially old data
                    setIsReady(true);
                }
            } else {
                router.push('/login');
            }
        };

        performAuth();
    }, [searchParams, router, toast]);

    if (!isAuthenticated || !isReady) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-lg">正在准备您的学习环境...</p>
            </div>
        );
    }

    return React.cloneElement(children as React.ReactElement, { handleLogout });
}

export default function Home() {
    return (
        <AuthWrapper>
            <MainContent handleLogout={() => { }} />
        </AuthWrapper>
    );
}

function MainContent({ handleLogout }: { handleLogout: () => void }) {
    const [terms, setTerms] = useState<LiteraryTerm[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentView, setCurrentView] = useState<View>('practice');
    const { toast } = useToast();

    const fetchTerms = useCallback(async () => {
        setIsLoading(true);
        const fetchedTerms = await getTerms();
        setTerms(fetchedTerms);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchTerms();
    }, [fetchTerms]);

    const handleAddTerm = async (term: string, explanation: string) => {
        setIsProcessing(true);
        try {
            const exerciseResult = await generateFillInBlankExercises({ term, explanation });
            const newTermData: LiteraryTermCreate = {
                term,
                explanation,
                exercise: exerciseResult.exercise,
                answer: term,
                isDifficult: false,
                status: 'unanswered',
                userAnswer: '',
                groupName: 'Manual',
            };
            const newTerm = await addTerm(newTermData);
            setTerms((prevTerms) => [newTerm, ...prevTerms]);
            toast({
                title: "术语已添加！",
                description: `已成功为“${term}”创建练习并存入云端。`,
            });
            setCurrentView('practice');
        } catch (error) {
            console.error('Failed to add term:', error);
            const errorMessage = error instanceof Error ? error.message : '一个未知错误发生了。';
            toast({
                variant: "destructive",
                title: "出错了",
                description: `${errorMessage}`,
            });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleUpdateTerm = async (updatedTerm: LiteraryTerm) => {
        setTerms((prevTerms) =>
            prevTerms.map((t) => (t.id === updatedTerm.id ? updatedTerm : t))
        );
        try {
            await updateTerm(updatedTerm.id, updatedTerm);
        } catch (error) {
            console.error('Failed to update term:', error);
            const errorMessage = error instanceof Error ? error.message : '一个未知错误发生了。';
            toast({
                variant: "destructive",
                title: "出错了",
                description: `更新术语失败: ${errorMessage}`,
            });
            fetchTerms(); // Re-fetch to ensure consistency
        }
    };

    const handleDeleteTerm = async (id: number) => {
        const originalTerms = [...terms];
        setTerms(prevTerms => prevTerms.filter(t => t.id !== id));
        try {
            await deleteTerm(id);
            toast({
                title: "术语已删除",
                description: "该术语已从您的资料库中移除。",
            });
        } catch (error) {
            console.error('Failed to delete term:', error);
            const errorMessage = error instanceof Error ? error.message : '一个未知错误发生了。';
            toast({
                variant: "destructive",
                title: "删除失败",
                description: errorMessage,
            });
            setTerms(originalTerms);
        }
    };

    const renderContent = () => {
        if (isLoading && currentView === 'practice') {
            return (
                <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground py-12 rounded-xl bg-card h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-lg">正在从云端加载您的学习资料...</p>
                </div>
            );
        }

        switch (currentView) {
            case 'practice':
                return <PracticeSession terms={terms} onUpdateTerm={handleUpdateTerm} onDeleteTerm={handleDeleteTerm} getGroups={getGroups} />;
            case 'add':
                return <AddTermView onAddTerm={handleAddTerm} isLoading={isProcessing} />;
        }
    }

    return (
        <AppLayout currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout}>
            {renderContent()}
        </AppLayout>
    );
}
