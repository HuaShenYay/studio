
"use client";
import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, MoreVertical, Trash2, Lightbulb, RefreshCcw, FolderCog, Pencil } from 'lucide-react';
import type { LiteraryTerm, PracticeStatus, TermGroup } from '@/types';
import { isDue, reviewFsrs, readFsrsFromUserAnswer, writeFsrsToUserAnswer, type FsrsGrade } from '@/lib/fsrs';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { Combobox } from '@/components/ui/combobox';
import EditExerciseDialog from './EditExerciseDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


type ExerciseCardProps = {
    termData: LiteraryTerm;
    onUpdate: (term: LiteraryTerm, isRegenerating?: boolean) => void;
    onDelete: (id: number) => void;
    groups: TermGroup[];
    mode?: 'learn' | 'review';
};

export default function ExerciseCard({ termData, onUpdate, onDelete, groups = [], mode = 'review' }: ExerciseCardProps) {
    const { answer, exercise, status: initialStatus, userAnswer: initialUserAnswer } = termData;
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>(initialUserAnswer || {});
    const fsrsState = readFsrsFromUserAnswer(initialUserAnswer) || null;
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [status, setStatus] = useState<PracticeStatus | Record<string, PracticeStatus>>(initialStatus);

    const blankCount = (exercise.match(/____/g) || []).length;

    useEffect(() => {
        setUserAnswers(termData.userAnswer || {});
        setStatus(termData.status);
    }, [termData]);

    const handleAnswerChange = (index: number, value: string) => {
        setUserAnswers(prev => ({ ...prev, [index]: value }));
        if (status !== 'unanswered') {
            setStatus('unanswered');
        }
    };

    const handleCheckAnswer = () => {
        let allCorrect = true;
        const newStatus: Record<string, PracticeStatus> = {};
        
        for (let i = 0; i < blankCount; i++) {
            const isCorrect = (userAnswers[i] || '').trim().toLowerCase() === (answer[i] || '').trim().toLowerCase();
            newStatus[i] = isCorrect ? 'correct' : 'incorrect';
            if (!isCorrect) {
                allCorrect = false;
            }
        }
        
        setStatus(allCorrect ? 'correct' : newStatus);
        onUpdate({ ...termData, status: allCorrect ? 'correct' : 'incorrect', userAnswer: { ...userAnswers } });
    };

    const handleGrade = (grade: FsrsGrade) => {
        const nextFsrs = reviewFsrs(fsrsState, grade);
        const nextUserAnswer = writeFsrsToUserAnswer({ ...userAnswers }, nextFsrs);
        onUpdate({ ...termData, userAnswer: nextUserAnswer });
    }
    
    const handleTryAgain = () => {
        setStatus('unanswered');
        onUpdate({ ...termData, status: 'unanswered' });
    }

    const handleToggleDifficult = () => {
        onUpdate({ ...termData, isDifficult: !termData.isDifficult });
    };

    const handleDelete = () => {
        onDelete(termData.id);
    }
    
    const handleGroupChange = (newGroupName: string) => {
        onUpdate({ ...termData, groupName: newGroupName });
    };
    
    const handleSaveEdit = (updatedTerm: LiteraryTerm) => {
        onUpdate(updatedTerm, true);
        setIsEditOpen(false);
    };
    
    const getOverallStatus = (): PracticeStatus => {
        if (typeof status === 'object') return 'incorrect';
        return status;
    }

    const borderColorClass = {
        correct: 'border-green-500/50 dark:border-green-400/50',
        incorrect: 'border-destructive/50',
        unanswered: 'border-border'
    }[getOverallStatus()];

    const backgroundColorClass = {
        correct: 'bg-green-500/5',
        incorrect: 'bg-destructive/5',
        unanswered: 'bg-card'
    }[getOverallStatus()];

    const renderExercise = () => {
        const parts = exercise.split('____');
        return (
            <div className="text-lg leading-relaxed text-foreground/90 flex flex-wrap items-center">
                {parts.map((part, index) => (
                    <React.Fragment key={index}>
                        <span>{part}</span>
                        {index < parts.length - 1 && (
                             <span className="inline-block mx-1 my-1 align-bottom">
                                {mode === 'learn' ? (
                                  <span className="px-2 py-1 rounded bg-muted text-muted-foreground">{answer[index] || ''}</span>
                                ) : (
                                  <Input
                                      type="text"
                                      placeholder={`答案 ${index + 1}`}
                                      value={userAnswers[index] || ''}
                                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && getOverallStatus() === 'unanswered' && handleCheckAnswer()}
                                      disabled={getOverallStatus() !== 'unanswered'}
                                      className={cn(
                                          "text-base inline-block w-36 h-8",
                                          typeof status === 'object' && status[index] === 'incorrect' && "border-destructive focus-visible:ring-destructive"
                                      )}
                                  />
                                )}
                             </span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    const renderFeedback = () => {
        const overallStatus = getOverallStatus();
        if (overallStatus === 'correct') {
            return (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5"/>
                    <p className="font-semibold">回答正确！</p>
                </div>
            )
        }
        if (overallStatus === 'incorrect') {
             return (
                <div className="flex items-center gap-2 text-destructive">
                    <Lightbulb className="h-5 w-5"/>
                     <p className="font-semibold">部分答案不正确。正确答案是：{Object.values(answer).join(' / ')}</p>
                </div>
            )
        }
        return null;
    }

    const due = isDue(fsrsState);
    return (
        <>
        <Card className={cn("transition-all duration-300", borderColorClass, backgroundColorClass)}>
            <CardContent className="pt-6">
                <blockquote className="border-l-4 border-primary/20 pl-4">
                    {renderExercise()}
                </blockquote>
                {mode === 'review' ? (
                  <div className="mt-6 flex flex-col sm:flex-row gap-2">
                    {getOverallStatus() === 'unanswered' ? (
                        <Button onClick={handleCheckAnswer} className="shrink-0 w-full">检查答案</Button>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full">
                            <Button onClick={() => handleGrade('again')} variant="destructive">再现（Again）</Button>
                            <Button onClick={() => handleGrade('hard')} variant="secondary">较难（Hard）</Button>
                            <Button onClick={() => handleGrade('good')}>良好（Good）</Button>
                            <Button onClick={() => handleGrade('easy')} variant="outline">容易（Easy）</Button>
                            <Button onClick={handleTryAgain} variant="ghost"><RefreshCcw className="mr-2 h-4 w-4"/>再试一次</Button>
                        </div>
                    )}
                  </div>
                ) : null}
                 <div className="mt-4 min-h-[28px]">
                    {renderFeedback()}
                </div>
            </CardContent>
            <CardFooter className="bg-transparent dark:bg-background/20 px-4 py-2 flex justify-between items-center gap-4">
                 {mode === 'review' ? (
                   <div className="text-xs text-muted-foreground">
                      {fsrsState ? (
                          <>下次复习时间：{new Date(fsrsState.scheduledAt).toLocaleString()} {due ? '(到期)' : ''}</>
                      ) : (
                          <>尚未建立记忆曲线，完成一次打分以开始安排复习。</>
                      )}
                   </div>
                 ) : <div />}
                 <div className='flex items-center flex-shrink-0'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-5 w-5" />
                          <span className="sr-only">更多选项</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={handleToggleDifficult}>
                            <Star className={cn("mr-2 h-4 w-4", termData.isDifficult && 'text-yellow-500 fill-yellow-400')} />
                            <span>{termData.isDifficult ? '从复习列表移除' : '添加到复习列表'}</span>
                         </DropdownMenuItem>

                         <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <FolderCog className="mr-2 h-4 w-4" />
                                <span>修改分组</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent className="p-2">
                                     <Combobox
                                        options={groups.map(g => ({ label: `${g.groupName} (${g.count})`, value: g.groupName }))}
                                        value={termData.groupName || ''}
                                        onChange={handleGroupChange}
                                        entityName="分组"
                                    />
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                         </DropdownMenuSub>
                         
                         <DropdownMenuItem onClick={(e)=>{ e.preventDefault(); setIsEditOpen(true); }}>
                           <Pencil className="mr-2 h-4 w-4" />
                           <span>编辑练习</span>
                         </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>删除</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>您确定要删除吗？</AlertDialogTitle>
                              <AlertDialogDescription>
                                此操作无法撤销。这将从您的资料库中永久删除术语 “<strong>{termData.term}</strong>” 及其相关的练习。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete} className={cn(buttonVariants({ variant: "destructive" }))}>删除</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardFooter>
        </Card>
        <EditExerciseDialog
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            termData={termData}
            onSave={handleSaveEdit}
        />
        </>
    );
}
