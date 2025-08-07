
"use client";

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { CritiqueWritingOutput } from '@/ai/flows/critique-writing';

type Suggestion = CritiqueWritingOutput['suggestions'][0];

interface InteractiveCritiqueProps {
  originalText: string;
  suggestions: Suggestion[];
}

// Simple escape function for regex
const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
};

export default function InteractiveCritique({ originalText, suggestions }: InteractiveCritiqueProps) {
    if (!suggestions || suggestions.length === 0) {
        return <p className="text-base whitespace-pre-wrap leading-relaxed">{originalText}</p>;
    }

    // Create a regex that finds any of the suggestion segments
    // This is a bit naive as it doesn't handle overlapping segments well, but it's a start.
    const allSegments = suggestions.map(s => escapeRegExp(s.originalSegment)).join('|');
    const regex = new RegExp(`(${allSegments})`, 'g');

    const parts = originalText.split(regex).filter(Boolean);

    return (
        <TooltipProvider>
            <p className="text-base whitespace-pre-wrap leading-relaxed">
                {parts.map((part, index) => {
                    const suggestion = suggestions.find(s => s.originalSegment === part);
                    if (suggestion) {
                        return (
                            <Tooltip key={index} delayDuration={100}>
                                <TooltipTrigger asChild>
                                    <span className="bg-yellow-200 dark:bg-yellow-800/50 px-1 rounded-sm cursor-pointer">
                                        {part}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm w-full" side="top">
                                    <div className="p-2">
                                        <p className="text-xs text-muted-foreground mb-2">修改建议:</p>
                                        <p className="font-semibold">{suggestion.suggestedChange}</p>
                                        <p className="text-xs text-muted-foreground mt-3 mb-1">理由:</p>
                                        <p className="text-sm">{suggestion.comment}</p>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        );
                    }
                    return <span key={index}>{part}</span>;
                })}
            </p>
        </TooltipProvider>
    );
}
