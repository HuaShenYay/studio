"use client";

import React, { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { CritiqueWritingOutput } from '@/ai/flows/critique-writing';

type Suggestion = CritiqueWritingOutput['suggestions'][0];

interface InteractiveCritiqueProps {
  originalText: string;
  suggestions: Suggestion[];
}

type HighlightRange = {
  start: number;
  end: number;
  suggestion: Suggestion;
};

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return !(aEnd <= bStart || aStart >= bEnd);
}

// For each suggestion, find the first occurrence of its originalSegment
// that does not overlap with already assigned ranges. This preserves
// the intent even when segments repeat or partially overlap.
function computeHighlightRanges(originalText: string, suggestions: Suggestion[]): HighlightRange[] {
  const ranges: HighlightRange[] = [];
  if (!originalText || !suggestions?.length) return ranges;

  for (const suggestion of suggestions) {
    const segment = suggestion.originalSegment;
    if (!segment) continue;

    let searchFrom = 0;
    while (searchFrom < originalText.length) {
      const idx = originalText.indexOf(segment, searchFrom);
      if (idx === -1) break;
      const start = idx;
      const end = idx + segment.length;
      const hasOverlap = ranges.some(r => rangesOverlap(start, end, r.start, r.end));
      if (!hasOverlap) {
        ranges.push({ start, end, suggestion });
        break; // assign this suggestion once
      }
      searchFrom = idx + 1;
    }
  }

  ranges.sort((a, b) => a.start - b.start);
  return ranges;
}

export default function InteractiveCritique({ originalText, suggestions }: InteractiveCritiqueProps) {
  const ranges = useMemo(() => computeHighlightRanges(originalText, suggestions), [originalText, suggestions]);

  if (!ranges.length) {
    return <p className="text-base whitespace-pre-wrap leading-relaxed">{originalText}</p>;
  }

  const parts: Array<{ text: string; suggestion?: Suggestion }> = [];
  let cursor = 0;
  for (const r of ranges) {
    if (cursor < r.start) {
      parts.push({ text: originalText.slice(cursor, r.start) });
    }
    parts.push({ text: originalText.slice(r.start, r.end), suggestion: r.suggestion });
    cursor = r.end;
  }
  if (cursor < originalText.length) {
    parts.push({ text: originalText.slice(cursor) });
  }

  return (
    <TooltipProvider>
      <div className="text-base whitespace-pre-wrap leading-relaxed">
        {parts.map((part, index) => {
          if (part.suggestion) {
            return (
              <Tooltip key={index} delayDuration={100}>
                <TooltipTrigger asChild>
                  <span className="bg-yellow-200 dark:bg-yellow-800/50 px-1 rounded-sm cursor-pointer">
                    {part.text}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm w-full" side="top">
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground mb-2">修改建议:</p>
                    <p className="font-semibold">{part.suggestion.suggestedChange}</p>
                    <p className="text-xs text-muted-foreground mt-3 mb-1">理由:</p>
                    <p className="text-sm">{part.suggestion.comment}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          }
          return <span key={index}>{part.text}</span>;
        })}
      </div>
    </TooltipProvider>
  );
}
