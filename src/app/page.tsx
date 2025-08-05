'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { generateFillInBlankExercises } from '@/ai/flows/generate-fill-in-blank';
import type { LiteraryTerm, LiteraryTermCreate } from '@/types';
import AddTermView from '@/components/AddTermView';
import PracticeSession from '@/components/PracticeSession';
import TextAnalysis from '@/components/TextAnalysis';
import { useToast } from "@/hooks/use-toast";
import AppLayout from '@/components/AppLayout';
import { addTerm, getTerms, updateTerm } from '@/services/terms-service';
import { extractTermsFromPdf } from '@/ai/flows/extract-terms-from-pdf';

type View = 'practice' | 'add' | 'analysis';

function AuthWrapper({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleLogout = useCallback(() => {
        sessionStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
        router.push('/login');
    }, [router]);

    useEffect(() => {
        const loggedIn = searchParams.get('loggedin') === 'true';
        if (loggedIn) {
            sessionStorage.setItem('isAuthenticated', 'true');
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
            setIsAuthenticated(true);
        } else {
            const sessionAuth = sessionStorage.getItem('isAuthenticated') === 'true';
            if (sessionAuth) {
                setIsAuthenticated(true);
            } else {
                router.push('/login');
            }
        }
    }, [searchParams, router]);

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

    useEffect(() => {
        const fetchTerms = async () => {
            setIsLoading(true);
            const fetchedTerms = await getTerms();
            setTerms(fetchedTerms);
            setIsLoading(false);
        };
        fetchTerms();
    }, []);

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
            toast({
                variant: "destructive",
                title: "出错了",
                description: "添加术语失败。请检查您的网络连接或稍后重试。",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePdfUpload = async (pdfText: string) => {
        setIsProcessing(true);
        toast({ title: "文件处理中", description: "AI正在从PDF中提取术语，请稍候..." });
        try {
            const { extractedTerms } = await extractTermsFromPdf({ pdfContent: pdfText });

            if (!extractedTerms || extractedTerms.length === 0) {
                toast({ variant: "destructive", title: "提取失败", description: "AI未能在文档中找到可用的术语和解释。" });
                return;
            }

            toast({ title: "提取成功！", description: `AI识别出 ${extractedTerms.length} 个术语，正在为您生成练习...` });

            let count = 0;
            for (const { term, explanation } of extractedTerms) {
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
                    };
                    const newTerm = await addTerm(newTermData);
                    setTerms((prevTerms) => [newTerm, ...prevTerms]);
                    count++;
                } catch (genError) {
                    console.error(`Failed to generate exercise for ${term}`, genError);
                }
            }

            toast({
                title: "批量导入完成！",
                description: `成功添加了 ${count} 个新术语。`,
            });
            setCurrentView('practice');

        } catch (error) {
            console.error('Failed to process PDF:', error);
            toast({
                variant: "destructive",
                title: "PDF处理失败",
                description: "AI在分析PDF时遇到问题，请检查文件内容或稍后再试。",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdateTerm = async (updatedTerm: LiteraryTerm) => {
        setTerms((prevTerms) =>
            prevTerms.map((t) => (t.id === updatedTerm.id ? updatedTerm : t))
        );
        await updateTerm(updatedTerm.id, updatedTerm);
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground py-12 rounded-xl bg-card h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-lg">正在从云端加载您的学习资料...</p>
                </div>
            );
        }

        switch (currentView) {
            case 'practice':
                return <PracticeSession terms={terms} onUpdateTerm={handleUpdateTerm} />;
            case 'add':
                return <AddTermView onAddTerm={handleAddTerm} onPdfUpload={handlePdfUpload} isLoading={isProcessing} />;
            case 'analysis':
                return <TextAnalysis />;
        }
    }

    return (
        <AppLayout currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout}>
            {renderContent()}
        </AppLayout>
    );
}
