'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Sparkles, ListChecks } from 'lucide-react';
import { generateFillInBlankExercise } from '@/ai/flows/generate-fill-in-blank';
import type { LiteraryTerm, LiteraryTermCreate } from '@/types';
import PracticeSession from '@/components/PracticeSession';
import WritingAdvisorView from '@/components/WritingAdvisorView';
import DailyWorks from '@/components/DailyWorks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { generateCritiqueAdvice } from '@/ai/flows/generate-critique-advice';
import type { CritiqueAdviceOutput } from '@/ai/flows/generate-critique-advice';
import { generateArgumentEssay } from '@/ai/flows/generate-argument-essay';
import type { ArgumentEssayOutput } from '@/ai/flows/generate-argument-essay';
import DueReviewView from '@/components/DueReviewView';
import { useToast } from "@/hooks/use-toast";
import AppLayout from '@/components/AppLayout';
import { addTerm, getTerms, updateTerm, deleteTerm, getGroups, resetAllTerms, renameGroup, deleteGroup as deleteGroupService } from '@/services/terms-service';

type View = 'practice' | 'advisor' | 'critiqueAdvice' | 'argumentEssay' | 'dailyWorks' | 'dueReview' | 'about';

function AuthWrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
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
    const [currentView, setCurrentView] = useState<View>('about');
    const [advice, setAdvice] = useState<CritiqueAdviceOutput | null>(null);
    const [essay, setEssay] = useState<ArgumentEssayOutput | null>(null);
    const [adviceLoading, setAdviceLoading] = useState(false);
    const [essayLoading, setEssayLoading] = useState(false);
    const [adviceInput, setAdviceInput] = useState('请以“现代都市孤独体验”为主题给出评论写作建议');
    const [essayInput, setEssayInput] = useState('结合鲁迅小说中的“启蒙与反启蒙”主题进行论述');
    const { toast } = useToast();
    
    const fetchTerms = useCallback(async () => {
        setIsLoading(true);
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
                const fetchedTerms = await getTerms();
                setTerms(fetchedTerms);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : '一个未知错误发生了。';
                toast({
                    variant: "destructive",
                    title: "初始化练习失败",
                    description: errorMessage,
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (currentView === 'practice') {
            initializeSession();
        }
    }, [currentView, toast]);


    const handleAddTerm = async (term: string, explanation: string, groupName: string | null) => {
        setIsProcessing(true);
        try {
            // 动态确定挖空数量：每 30 字考虑挖 1 个（范围 3-8）
            const textLen = explanation.replace(/\s+/g, '').length;
            const dynamicBlanks = Math.max(3, Math.min(8, Math.round(textLen / 30)));
            const exerciseResult = await generateFillInBlankExercise({ term, explanation, blanks: dynamicBlanks });
            const newTermData: LiteraryTermCreate = {
                term,
                explanation,
                exercise: exerciseResult.exercise,
                answer: exerciseResult.answers,
                isDifficult: false,
                status: 'unanswered',
                userAnswer: {},
                groupName: groupName,
            };
            const newTerm = await addTerm(newTermData);
            setTerms((prevTerms) => [newTerm, ...prevTerms]);
            toast({
                title: "术语已添加！",
                description: `已成功为“${term}”创建练习并存入云端。`,
            });
            return true; // Indicate success
        } catch (error) {
            console.error('Failed to add term:', error);
            const errorMessage = error instanceof Error ? error.message : '一个未知错误发生了。';
            toast({
                variant: "destructive",
                title: "出错了",
                description: `${errorMessage}`,
            });
            return false; // Indicate failure
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleUpdateTerm = async (updatedTerm: LiteraryTerm) => {
        const originalTerms = [...terms];
        const originalTerm = originalTerms.find(t => t.id === updatedTerm.id);
        
        setTerms((prevTerms) =>
            prevTerms.map((t) => (t.id === updatedTerm.id ? updatedTerm : t))
        );

        if (!originalTerm) return;

        try {
            const changes: Partial<LiteraryTerm> = {};
            if (JSON.stringify(updatedTerm.status) !== JSON.stringify(originalTerm.status)) changes.status = updatedTerm.status;
            if (JSON.stringify(updatedTerm.userAnswer) !== JSON.stringify(originalTerm.userAnswer)) changes.userAnswer = updatedTerm.userAnswer;
            if (updatedTerm.isDifficult !== originalTerm.isDifficult) changes.isDifficult = updatedTerm.isDifficult;
            if (updatedTerm.groupName !== originalTerm.groupName) changes.groupName = updatedTerm.groupName;
            
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
            await fetchTerms();
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
            await fetchTerms();
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
        if (isLoading && (currentView === 'practice')) {
            return (
                <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground py-12 rounded-xl bg-card h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-lg">正在准备您的学习环境...</p>
                </div>
            );
        }

        switch (currentView) {
            case 'practice': // 合并“到期复习 + 全部练习”
                return (
                    <PracticeSession
                        terms={terms}
                        onUpdateTerm={handleUpdateTerm}
                        onDeleteTerm={handleDeleteTerm}
                        getGroups={getGroups}
                        onRenameGroup={handleRenameGroup}
                        onDeleteGroup={handleDeleteGroup}
                        onAddTerm={handleAddTerm}
                        isAddingTerm={isProcessing}
                        onImported={fetchTerms}
                    />
                );
            case 'advisor':
                return <WritingAdvisorView />;
            case 'about':
                return (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>文词通 · 软件介绍</CardTitle>
                                <CardDescription>一体化的术语管理、学习与写作辅助平台</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-muted-foreground">
                                <p>文词通专注于文学术语的系统化学习与写作能力提升。核心优势：</p>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li><b>FSRS 记忆算法</b>：基于评分（Again/Hard/Good/Easy）动态安排复习，平衡记忆稳定度与学习效率。</li>
                                    <li><b>Gemini-2.5-Flash</b>：用新一代生成式模型提供术语解释、评论/论述写作建议与每日作品选。</li>
                                    <li><b>直观学习模式</b>：直接在原文中“就地挖空”，保持文本一致性；学习模式下可集中管理术语与分组。</li>
                                    <li><b>到期复习</b>：今日到期卡片集中复盘，先核对再评分，保障记忆曲线有效更新。</li>
                                </ul>
                                <p>从“添加术语—自动挖空—学习管理—到期复习—写作指导”，形成闭环的高效学习体验。</p>
                            </CardContent>
                        </Card>
                    </div>
                );
            case 'dailyWorks':
                return <DailyWorks />;
            case 'critiqueAdvice':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5"/>文学评论写作建议</CardTitle>
                            <CardDescription>输入主题或作品名称，生成评论大纲与论证思路。</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea value={adviceInput} onChange={e=>setAdviceInput(e.target.value)} className="min-h-[100px]"/>
                            <Button onClick={async()=>{setAdviceLoading(true);setAdvice(null);try{const res=await generateCritiqueAdvice({topic:adviceInput,era:'中国现当代',focus:'主题、结构、语言、意象、叙事策略'});setAdvice(res);}catch(e:any){toast({variant:'destructive',title:'生成失败',description:e?.message||'请稍后再试'})}finally{setAdviceLoading(false)}}} disabled={adviceLoading}>
                                {adviceLoading? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                                生成建议
                            </Button>
                            {advice && (
                                <div className="space-y-4 text-muted-foreground">
                                    <div>
                                        <h4 className="font-semibold mb-2">评论大纲</h4>
                                        <ul className="list-disc pl-6">{advice.outline.map((o,i)=>(<li key={i}>{o}</li>))}</ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">论点-证据-分析 示例</h4>
                                        <ul className="list-disc pl-6 space-y-2">
                                            {advice.arguments.map((a,i)=> (<li key={i}><p><b>论点：</b>{a.point}</p><p><b>证据：</b>{a.evidence}</p><p><b>分析：</b>{a.analysis}</p></li>))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">常见误区</h4>
                                        <ul className="list-disc pl-6">{advice.pitfalls.map((p,i)=>(<li key={i}>{p}</li>))}</ul>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            case 'argumentEssay':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5"/>论述题写作建议</CardTitle>
                            <CardDescription>输入题目或材料，生成中心论点与段落大纲。</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea value={essayInput} onChange={e=>setEssayInput(e.target.value)} className="min-h-[100px]"/>
                            <Button onClick={async()=>{setEssayLoading(true);setEssay(null);try{const res=await generateArgumentEssay({prompt:essayInput,era:'中国现当代',length:600});setEssay(res);}catch(e:any){toast({variant:'destructive',title:'生成失败',description:e?.message||'请稍后再试'})}finally{setEssayLoading(false)}}} disabled={essayLoading}>
                                {essayLoading? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                                生成建议
                            </Button>
                            {essay && (
                                <div className="space-y-4 text-muted-foreground">
                                    <div>
                                        <h4 className="font-semibold mb-2">中心论点</h4>
                                        <p>{essay.thesis}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">段落大纲</h4>
                                        <ul className="list-disc pl-6">{essay.outline.map((o,i)=>(<li key={i}>{o}</li>))}</ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">段落写作提示</h4>
                                        <ul className="list-disc pl-6">{essay.paragraphHints.map((h,i)=>(<li key={i}>{h}</li>))}</ul>
                                    </div>
                                    {essay.references.length>0 && (
                                        <div>
                                            <h4 className="font-semibold mb-2">可引用参考</h4>
                                            <ul className="list-disc pl-6">{essay.references.map((r,i)=>(<li key={i}>{r}</li>))}</ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            case 'dueReview':
                return <DueReviewView />;
        }
    }

    return (
        <AppLayout currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout}>
            {renderContent()}
        </AppLayout>
    );
}
