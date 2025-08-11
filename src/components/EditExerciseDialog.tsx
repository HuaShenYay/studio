
"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb } from 'lucide-react';
import type { LiteraryTerm } from "@/types";

type EditExerciseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  termData: LiteraryTerm;
  onSave: (updatedTerm: LiteraryTerm) => void;
};

// Converts the explanation with [bracketed] answers into the final exercise and answer map
function processBrackets(text: string): { exercise: string; answer: Record<string, string> } {
  const matches = [...text.matchAll(/\[([^\]]+)\]/g)];
  const answer: Record<string, string> = {};
  matches.forEach((match, index) => {
    answer[index] = match[1];
  });
  const exercise = text.replace(/\[[^\]]+\]/g, '____');
  return { exercise, answer };
}

// Converts a term's explanation, exercise, and answers back into a single string with [brackets]
function toBracketedText(explanation: string, exercise: string, answer: Record<string, string>): string {
  if (!exercise.includes('____')) {
    return explanation; // If no blanks, return original explanation
  }
  const answerValues = Object.values(answer);
  let bracketedText = exercise;
  answerValues.forEach(ans => {
    bracketedText = bracketedText.replace('____', `[${ans}]`);
  });
  return bracketedText;
}


export default function EditExerciseDialog({ open, onOpenChange, termData, onSave }: EditExerciseDialogProps) {
  const [term, setTerm] = useState(termData.term);
  const [bracketedExplanation, setBracketedExplanation] = useState('');

  useEffect(() => {
    if (open) {
      setTerm(termData.term);
      setBracketedExplanation(toBracketedText(termData.explanation, termData.exercise, termData.answer));
    }
  }, [open, termData]);

  const handleSave = () => {
    const { exercise, answer } = processBrackets(bracketedExplanation);
    
    // The new explanation is the text with brackets removed, but not replaced with blanks.
    const newExplanation = bracketedExplanation.replace(/\[/g, '').replace(/\]/g, '');

    const updatedTerm: LiteraryTerm = {
      ...termData,
      term,
      explanation: newExplanation,
      exercise,
      answer,
      status: 'unanswered', // Reset status after editing
      userAnswer: {},
    };
    onSave(updatedTerm);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>编辑练习</DialogTitle>
          <DialogDescription>
            修改术语名称，并在下方的解释中用 `[方括号]` 标记要挖空的内容。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="term" className="text-right">
              术语
            </Label>
            <Input
              id="term"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="explanation">
              解释与挖空
            </Label>
            <Textarea
              id="explanation"
              value={bracketedExplanation}
              onChange={(e) => setBracketedExplanation(e.target.value)}
              className="min-h-[200px] text-base"
              placeholder="输入解释，并用 [方括号] 括起答案..."
            />
             <Alert className="mt-2">
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                    <strong>提示:</strong> 将想要挖空的词语用英文方括号 <code>[ ]</code> 括起来，例如 <code>[这个词]</code>。系统将自动为您生成填空题。
                </AlertDescription>
            </Alert>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSave}>预览并保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
