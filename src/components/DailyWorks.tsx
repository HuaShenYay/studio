"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { generateDailyWorks } from '@/ai/flows/generate-daily-works';

type Work = { title: string; author: string; era: '中国古代' | '中国现当代' | '外国'; snippet: string };

export default function DailyWorks() {
  const [list, setList] = React.useState<Work[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const run = async () => {
      try {
        const res = await generateDailyWorks({ count: 3 });
        setList(res.items as Work[]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="mb-6 flex flex-col gap-4">
      {loading ? (
        <Card><CardHeader><CardTitle>每日作品选</CardTitle><CardDescription>AI 正在为你挑选…</CardDescription></CardHeader></Card>
      ) : (
      list.map((w, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle>每日作品选 · {w.era}</CardTitle>
            <CardDescription>{w.author}《{w.title}》</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base whitespace-pre-wrap leading-relaxed">{w.snippet}</p>
          </CardContent>
        </Card>
      ))
      )}
    </div>
  );
}



