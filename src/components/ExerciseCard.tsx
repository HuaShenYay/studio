"use client";
import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, XCircle, ChevronRight, Trash2, Lightbulb, RefreshCcw } from 'lucide-react';
import type { LiteraryTerm, PracticeStatus, TermGroup } from '@/types';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Combobox } from '@/components/ui/combobox';
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
    onUpdate: (term: LiteraryTerm) => void;
    onDelete: (id: number) => void;
    groups: TermGroup[];
};

export default function ExerciseCard({ termData, onUpdate, onDelete, groups = [] }: ExerciseCardProps) {
    const { answer, exercise, status: initialStatus, userAnswer: initialUserAnswer } = termData;
    const [userAnswer, setUserAnswer] = useState(initialUserAnswer || '');
    const [status, setStatus] = useState<PracticeStatus>(initialStatus);
    const [isIncorrect, setIsIncorrect] = useState(false);

    useEffect(() => {
        setUserAnswer(termData.userAnswer || '');
        setStatus(termData.status);
        setIsIncorrect(false);
    }, [termData]);

    const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserAnswer(e.target.value);
        if (status !== 'unanswered') {
            setStatus('unanswered');
            setIsIncorrect(false);
        }
    };

    const handleCheckAnswer = () => {
        const isCorrect = userAnswer.trim().toLowerCase() === answer.trim().toLowerCase();
        const newStatus = isCorrect ? 'correct' : 'incorrect';
        setStatus(newStatus);
        setIsIncorrect(!isCorrect);
        onUpdate({ ...termData, status: newStatus, userAnswer: userAnswer });
    };
    
    const handleTryAgain = () => {
        setStatus('unanswered');
        setIsIncorrect(false);
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

    const borderColorClass = {
        correct: 'border-green-500/50 dark:border-green-400/50',
        incorrect: 'border-destructive/50',
        unanswered: 'border-border'
    }[status];

    const backgroundColorClass = {
        correct: 'bg-green-500/5',
        incorrect: 'bg-destructive/5',
        unanswered: 'bg-card'
    }[status];

    const renderExercise = () => {
        const parts = exercise.split('____');
        return (
            <div className="text-lg leading-relaxed text-foreground/90">
                {parts.map((part, index) => (
                    <React.Fragment key={index}>
                        {part}
                        {index < parts.length - 1 && (
                             <span className="inline-block mx-1 align-bottom">
                                <Input
                                    type="text"
                                    placeholder="答案"
                                    value={userAnswer}
                                    onChange={handleAnswerChange}
                                    onKeyDown={(e) => e.key === 'Enter' && status === 'unanswered' && handleCheckAnswer()}
                                    disabled={status !== 'unanswered'}
                                    className={cn(
                                        "text-base inline-block w-48 h-8",
                                        isIncorrect && "border-destructive focus-visible:ring-destructive"
                                    )}
                                />
                             </span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    const renderFeedback = () => {
        if (status === 'correct') {
            return (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5"/>
                    <p className="font-semibold">回答正确！</p>
                </div>
            )
        }
        if (status === 'incorrect') {
             return (
                <div className="flex items-center gap-2 text-destructive">
                    <Lightbulb className="h-5 w-5"/>
                     <p className="font-semibold">答案不正确。正确答案是：<strong>{answer}</strong></p>
                </div>
            )
        }
        return null;
    }

    return (
        <Card className={cn("transition-all duration-300", borderColorClass, backgroundColorClass)}>
            <CardContent className="pt-6">
                <blockquote className="border-l-4 border-primary/20 pl-4">
                    {renderExercise()}
                </blockquote>
                <div className="mt-6 flex flex-col sm:flex-row gap-2">
                     {status === 'unanswered' ? (
                        <Button onClick={handleCheckAnswer} className="shrink-0 w-full">
                           检查答案 <ChevronRight className="ml-2 h-4 w-4"/>
                        </Button>
                    ) : (
                         <Button onClick={handleTryAgain} variant="secondary" className="shrink-0 w-full">
                            <RefreshCcw className="mr-2 h-4 w-4"/> 再试一次
                         </Button>
                    )}
                </div>
                 <div className="mt-4 min-h-[28px]">
                    {renderFeedback()}
                </div>
            </CardContent>
            <CardFooter className="bg-transparent dark:bg-background/20 px-4 py-2 flex justify-between items-center gap-4">
                 <div className="flex-1 min-w-0">
                     <Combobox
                        options={groups.map(g => ({ label: `${g.groupName} (${g.count})`, value: g.groupName }))}
                        value={termData.groupName || ''}
                        onChange={handleGroupChange}
                        entityName="分组"
                    />
                 </div>
                 <div className='flex items-center flex-shrink-0'>
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleToggleDifficult}
                                    aria-label={termData.isDifficult ? '从复习列表中移除' : '添加到复习列表'}
                                >
                                    <Star className={cn("h-5 w-5 transition-colors", termData.isDifficult ? 'text-yellow-500 fill-yellow-400' : 'text-muted-foreground hover:text-yellow-500')}/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{termData.isDifficult ? '从复习列表中移除' : '添加到复习列表'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <AlertDialog>
                      <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" aria-label="删除术语">
                                        <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive"/>
                                    </Button>
                                </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>删除术语</p>
                            </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
                </div>
            </CardFooter>
        </Card>
    );
}
