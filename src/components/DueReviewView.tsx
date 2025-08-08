"use client";

import React, { useEffect, useState, useCallback } from 'react';
import type { LiteraryTerm } from '@/types';
import { getDueTerms, updateTerm } from '@/services/terms-service';
import ExerciseCard from '@/components/ExerciseCard';
import { Loader2, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function DueReviewView() {
  const [terms, setTerms] = useState<LiteraryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDue = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDueTerms();
      setTerms(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '一个未知错误发生了。';
      toast({ variant: 'destructive', title: '加载到期卡片失败', description: msg });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchDue(); }, [fetchDue]);

  const handleUpdate = async (t: LiteraryTerm) => {
    setTerms(prev => prev.map(x => x.id === t.id ? t : x));
    try {
      await updateTerm(t.id, { status: t.status, userAnswer: t.userAnswer, isDifficult: t.isDifficult, groupName: t.groupName });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '一个未知错误发生了。';
      toast({ variant: 'destructive', title: '保存状态失败', description: msg });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-full bg-primary/10 text-primary"><CalendarClock className="h-5 w-5"/></div>
        <h2 className="text-2xl font-bold">今日到期复习</h2>
        <div className="text-sm text-muted-foreground">共 {terms.length} 张卡片</div>
        <div className="flex-1" />
        <Button variant="secondary" onClick={fetchDue}>刷新</Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/> 正在加载…</div>
      ) : (
        terms.length > 0 ? (
          <div className="space-y-4">
            {terms.map(t => (
              <ExerciseCard key={t.id} termData={t} onUpdate={handleUpdate} onDelete={()=>{}} groups={[]} mode="review" />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12 rounded-xl bg-card">今天没有到期卡片，明天再来～</div>
        )
      )}
    </div>
  );
}


