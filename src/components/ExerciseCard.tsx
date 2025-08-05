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

    const borderColor = {
        correct: 'border-green-500',
        incorrect: 'border-destructive',
        unanswered: 'border-border'
    }[status];

    const renderFeedback = () => {
        if (status === 'correct') {
            return (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5"/>
                    <p className="font-semibold">Correct!</p>
                </div>
            )
        }
        if (status === 'incorrect') {
             return (
                <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="h-5 w-5"/>
                    <p className="font-semibold">Not quite. The correct answer is: <strong>{termData.answer}</strong></p>
                </div>
            )
        }
        return null;
    }

    return (
        <Card className={cn("transition-colors duration-300 shadow-md", borderColor)}>
            <CardContent className="pt-6">
                <p className="text-lg font-serif leading-relaxed text-foreground/90">
                    {termData.exercise}
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <Input
                        type="text"
                        placeholder="Type your answer here..."
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && status === 'unanswered' && handleCheckAnswer()}
                        disabled={status !== 'unanswered'}
                        className="text-base"
                    />
                     {status === 'unanswered' ? (
                        <Button onClick={handleCheckAnswer} className="shrink-0">
                           Check Answer <ChevronRight className="ml-2 h-4 w-4"/>
                        </Button>
                    ) : (
                         <Button onClick={handleTryAgain} variant="secondary" className="shrink-0">Try Again</Button>
                    )}
                </div>
                 <div className="mt-4 min-h-[28px]">
                    {renderFeedback()}
                </div>
            </CardContent>
            <CardFooter className="bg-card/50 dark:bg-background/20 px-6 py-3 flex justify-end">
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleToggleDifficult}
                                aria-label={termData.isDifficult ? 'Remove from review list' : 'Add to review list'}
                            >
                                <Star className={cn("h-5 w-5 transition-colors", termData.isDifficult ? 'text-yellow-500 fill-yellow-400' : 'text-muted-foreground')}/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{termData.isDifficult ? 'Remove from review' : 'Add to review'}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </CardFooter>
        </Card>
    );
}
