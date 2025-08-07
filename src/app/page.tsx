'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { generateFillInBlankExercise } from '@/ai/flows/generate-fill-in-blank';
import type { LiteraryTerm, LiteraryTermCreate } from '@/types';
import AddTermView from '@/components/AddTermView';
import PracticeSession from '@/components/PracticeSession';
import { useToast } from "@/hooks/use-toast";
import AppLayout from '@/components/AppLayout';
import { addTerm, getTerms, updateTerm, deleteTerm, getGroups, resetAllTerms, renameGroup, deleteGroup as deleteGroupService } from '@/services/terms-service';

type View = 'practice' | 'add';

function AuthWrapper({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
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
            } else {
                router.push('/login');
            }
        };

        performAuth();
    }, [searchParams, router, toast]);

    if (!isAuthenticated) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-lg">正在验证身份...</p>
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
        try {
            const fetchedTerms = await getTerms();
            setTerms(fetchedTerms);
        } catch (error) {
             const errorMessage = error instanceof Error ? error.message : '一个未知错误发生了。';
            toast({
                variant: "destructive",
                title: "加载术语失败",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        const initializeSession = async () => {
            setIsLoading(true);
            try {
                await resetAllTerms();
                await fetchTerms();
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : '一个未知错误发生了。';
                toast({
                    variant: "destructive",
                    title: "重置练习失败",
                    description: `无法开始新的练习会话: ${errorMessage}`,
                });
                 // Still try to fetch terms even if reset fails
                await fetchTerms();
            }
        };

        initializeSession();
    }, [fetchTerms, toast]);

    const handleAddTerm = async (term: string, explanation: string, groupName: string | null) => {
        setIsProcessing(true);
        try {
            const exerciseResult = await generateFillInBlankExercise({ term, explanation });
            const newTermData: LiteraryTermCreate = {
                term,
                explanation,
                exercise: exerciseResult.exercise,
                answer: exerciseResult.answer,
                isDifficult: false,
                status: 'unanswered',
                userAnswer: '',
                groupName: groupName,
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
        const originalTerms = [...terms];
        const originalTerm = originalTerms.find(t => t.id === updatedTerm.id);
        
        // Optimistically update UI
        setTerms((prevTerms) =>
            prevTerms.map((t) => (t.id === updatedTerm.id ? updatedTerm : t))
        );

        if (!originalTerm) return;

        try {
            // Find what actually changed
            const changes: Partial<LiteraryTerm> = {};
            if (updatedTerm.status !== originalTerm.status) {
                changes.status = updatedTerm.status;
            }
            if (updatedTerm.userAnswer !== originalTerm.userAnswer) {
                changes.userAnswer = updatedTerm.userAnswer;
            }
            if (updatedTerm.isDifficult !== originalTerm.isDifficult) {
                changes.isDifficult = updatedTerm.isDifficult;
            }
            if (updatedTerm.groupName !== originalTerm.groupName) {
                changes.groupName = updatedTerm.groupName;
            }
            // Only call update if there are actual changes
            if (Object.keys(changes).length > 0) {
              await updateTerm(updatedTerm.id, changes);
            }
        } catch (error) {
            console.error('Failed to update term:', error);
            const errorMessage = error instanceof Error ? error.message : '一个未知错误发生了。';
            toast({
                variant: "destructive",
                title: "出错了",
                description: `更新术语失败: ${errorMessage}`,
            });
            // Revert UI on error
            setTerms(originalTerms);
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

    const handleRenameGroup = async (oldName: string, newName: string) => {
        try {
            await renameGroup(oldName, newName);
            await fetchTerms(); // Refresh all terms to reflect the change
            toast({
                title: '分组已重命名',
                description: `分组 “${oldName}” 已成功更名为 “${newName}”。`,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '一个未知错误发生了。';
            toast({
                variant: 'destructive',
                title: '重命名失败',
                description: errorMessage,
            });
        }
    };

    const handleDeleteGroup = async (groupName: string) => {
        try {
            await deleteGroupService(groupName);
            await fetchTerms(); // Refresh terms
            toast({
                title: '分组已删除',
                description: `分组 “${groupName}” 已被删除，其下的术语已被设为未分组。`,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '一个未知错误发生了。';
            toast({
                variant: 'destructive',
                title: '删除分组失败',
                description: errorMessage,
            });
        }
    };


    const renderContent = () => {
        if (isLoading && currentView === 'practice') {
            return (
                <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground py-12 rounded-xl bg-card h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-lg">正在准备您的学习环境...</p>
                </div>
            );
        }

        switch (currentView) {
            case 'practice':
                return (
                    <PracticeSession
                        terms={terms}
                        onUpdateTerm={handleUpdateTerm}
                        onDeleteTerm={handleDeleteTerm}
                        getGroups={getGroups}
                        onRenameGroup={handleRenameGroup}
                        onDeleteGroup={handleDeleteGroup}
                    />
                );
            case 'add':
                return <AddTermView onAddTerm={handleAddTerm} isLoading={isProcessing} getGroups={getGroups} />;
        }
    }

    return (
        <AppLayout currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout}>
            {renderContent()}
        </AppLayout>
    );
}
