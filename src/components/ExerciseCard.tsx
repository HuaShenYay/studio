"use client";
import { useState } from 'react';
import { Star, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import type { LiteraryTerm, PracticeStatus } from '@/types';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type ExerciseCardProps = {
    termData: LiteraryTerm;
    onUpdate: (term: LiteraryTerm) => void;
};

export default function ExerciseCard({ termData, onUpdate }: ExerciseCardProps) {
    const [userAnswer, setUserAnswer] = useState(termData.userAnswer);
    const [status, setStatus] = useState<PracticeStatus>(termData.status);

    const handleCheckAnswer = () => {
        const isCorrect = userAnswer.trim().toLowerCase() === termData.answer.trim().toLowerCase();
        const newStatus = isCorrect ? 'correct' : 'incorrect';
        setStatus(newStatus);
        onUpdate({ ...termData, status: newStatus, userAnswer });
    };
    
    const handleTryAgain = () => {
        setStatus('unanswered');
        onUpdate({ ...termData, status: 'unanswered' });
    }

    const handleToggleDifficult = () => {
        onUpdate({ ...termData, isDifficult: !termData.isDifficult });
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
                    <XCircle className="h-5 w-5"/>
                    <p className="font-semibold">不太对。正确答案是：<strong>{termData.answer}</strong></p>
                </div>
            )
        }
        return null;
    }

    return (
        <Card className={cn("transition-all duration-300", borderColorClass, backgroundColorClass)}>
            <CardContent className="pt-6">
                <blockquote className="text-lg leading-relaxed text-foreground/90 border-l-4 border-primary/20 pl-4">
                    {termData.exercise}
                </blockquote>
                <div className="mt-6 flex flex-col sm:flex-row gap-2">
                    <Input
                        type="text"
                        placeholder="在此输入您的答案..."
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && status === 'unanswered' && handleCheckAnswer()}
                        disabled={status !== 'unanswered'}
                        className="text-base"
                    />
                     {status === 'unanswered' ? (
                        <Button onClick={handleCheckAnswer} className="shrink-0">
                           检查答案 <ChevronRight className="ml-2 h-4 w-4"/>
                        </Button>
                    ) : (
                         <Button onClick={handleTryAgain} variant="secondary" className="shrink-0">再试一次</Button>
                    )}
                </div>
                 <div className="mt-4 min-h-[28px]">
                    {renderFeedback()}
                </div>
            </CardContent>
            <CardFooter className="bg-transparent dark:bg-background/20 px-6 py-3 flex justify-between items-center">
                 <div className="text-xs text-muted-foreground">
                    术语: <strong>{termData.term}</strong>
                 </div>
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
            </CardFooter>
        </Card>
    );
}
