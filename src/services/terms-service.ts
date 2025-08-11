
'use server';

import { supabase } from '@/lib/supabase';
import type { LiteraryTerm, LiteraryTermCreate, TermGroup } from '@/types';
import type { Database, Tables } from '@/lib/supabase';
import { readFsrsFromUserAnswer } from '@/lib/fsrs';

type LiteraryTermRow = Tables<'literary_terms'>;
type LiteraryTermInsert = Database['public']['Tables']['literary_terms']['Insert'];
type LiteraryTermUpdate = Database['public']['Tables']['literary_terms']['Update'];

const TERMS_TABLE = 'literary_terms';

const fromSupabase = (row: LiteraryTermRow): LiteraryTerm => ({
    id: row.id,
    createdAt: new Date(row.created_at),
    term: row.term,
    explanation: row.explanation,
    exercise: row.exercise,
    answer: row.answer ?? {}, // Default to empty object if null
    isDifficult: row.isDifficult,
    status: row.status,
    userAnswer: row.userAnswer ?? {}, // Default to empty object if null
    groupName: row.group_name,
});

const toSupabase = (termData: LiteraryTermCreate): LiteraryTermInsert => {
    return {
        term: termData.term,
        explanation: termData.explanation,
        exercise: termData.exercise,
        answer: termData.answer,
        isDifficult: termData.isDifficult,
        status: termData.status,
        userAnswer: termData.userAnswer,
        group_name: termData.groupName,
    };
};

export async function addTerm(termData: LiteraryTermCreate): Promise<LiteraryTerm> {
    const supabaseData = toSupabase(termData);
    const { data, error } = await supabase
        .from(TERMS_TABLE)
        .insert(supabaseData)
        .select()
        .single();

    if (error) {
        console.error('Error adding term:', error);
        throw new Error(`添加术语失败: ${error.message}`);
    }
    return fromSupabase(data);
}

export async function getTerms(): Promise<LiteraryTerm[]> {
    try {
        const { data, error } = await supabase
            .from(TERMS_TABLE)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            // Rethrow the error to be caught by the calling function
            throw error;
        }

        // If data is null or undefined, return an empty array
        return data ? data.map(fromSupabase) : [];
    } catch (error) {
        console.error('Error fetching terms:', error);
        // Ensure we throw a consistent error message
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        throw new Error(`获取术语列表失败: ${errorMessage}`);
    }
}

export async function getDueTerms(): Promise<LiteraryTerm[]> {
    try {
        const nowIso = new Date().toISOString();
        const { data, error } = await supabase
            .from(TERMS_TABLE)
            .select('*')
            .lte('fsrs_scheduled_at', nowIso)
            .order('fsrs_scheduled_at', { ascending: true });

        if (error) throw error;
        return data ? data.map(fromSupabase) : [];
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'An unknown error occurred.';
        throw new Error(`获取到期术语失败: ${msg}`);
    }
}

export async function updateTerm(id: number, changes: Partial<LiteraryTerm>): Promise<void> {
    const supabaseData: LiteraryTermUpdate = {};

    if (changes.status !== undefined) supabaseData.status = changes.status;
    if (changes.userAnswer !== undefined) supabaseData.userAnswer = changes.userAnswer;
    if (changes.isDifficult !== undefined) supabaseData.isDifficult = changes.isDifficult;
    if (changes.explanation !== undefined) supabaseData.explanation = changes.explanation;
    if (changes.term !== undefined) supabaseData.term = changes.term;
    if (changes.exercise !== undefined) supabaseData.exercise = changes.exercise;
    if (changes.answer !== undefined) supabaseData.answer = changes.answer;
    if (changes.hasOwnProperty('groupName')) {
        supabaseData.group_name = changes.groupName;
    }

    // Sync FSRS columns if userAnswer contains __fsrs
    if (changes.userAnswer) {
        const fsrs = readFsrsFromUserAnswer(changes.userAnswer as any);
        if (fsrs) {
            (supabaseData as any).fsrs_stability_days = fsrs.stabilityDays;
            (supabaseData as any).fsrs_difficulty = fsrs.difficulty;
            (supabaseData as any).fsrs_scheduled_at = fsrs.scheduledAt;
            (supabaseData as any).fsrs_last_reviewed_at = fsrs.lastReviewedAt;
            (supabaseData as any).fsrs_reps = fsrs.reps;
            (supabaseData as any).fsrs_lapses = fsrs.lapses;
        }
    }

    if (Object.keys(supabaseData).length === 0) {
        return;
    }

    const { error } = await supabase
        .from(TERMS_TABLE)
        .update(supabaseData)
        .eq('id', id);

    if (error) {
        console.error('Error updating term:', error);
        throw new Error(`更新术语失败: ${error.message}`);
    }
}

export async function deleteTerm(id: number): Promise<void> {
    const { error } = await supabase
        .from(TERMS_TABLE)
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error('Error deleting term:', error);
        throw new Error(`删除术语失败: ${error.message}`);
    }
}

export async function getGroups(): Promise<TermGroup[]> {
    const { data, error } = await supabase
        .from(TERMS_TABLE)
        .select('group_name');

    if (error) {
        console.error('Error fetching groups:', error);
        throw new Error(`获取小组列表失败: ${error.message}`);
    }

    if (!data) return [];
    
    const groupCounts = data.reduce((acc, { group_name }) => {
        if (group_name) {
            acc[group_name] = (acc[group_name] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(groupCounts).map(([groupName, count]) => ({
        groupName,
        count,
    }));
}

export async function renameGroup(oldName: string, newName: string): Promise<void> {
    const { error } = await supabase
        .from(TERMS_TABLE)
        .update({ group_name: newName })
        .eq('group_name', oldName);
    
    if (error) {
        console.error('Error renaming group: ', error);
        throw new Error(`重命名分组失败: ${error.message}`);
    }
}

export async function deleteGroup(groupName: string): Promise<void> {
    const { error } = await supabase
        .from(TERMS_TABLE)
        .update({ group_name: null })
        .eq('group_name', groupName);

    if (error) {
        console.error('Error deleting group: ', error);
        throw new Error(`删除分组失败: ${error.message}`);
    }
}

export async function createGroupIfNotExists(groupName: string): Promise<void> {
    // 通过插入一条占位记录确保分组被列出（不会影响统计，因为 terms 会真实计数）
    // 为避免污染真实数据，这里不插入记录，而是无操作：分组的存在感由术语数量决定。
    // 如果需要显式分组表，请在未来迁移到独立表。
    return;
}

export async function resetAllTerms(): Promise<void> {
    const { error } = await supabase
        .from(TERMS_TABLE)
        .update({ status: 'unanswered', userAnswer: {} })
        .neq('id', -1); 
    
    if (error) {
        console.error('Error resetting terms:', error);
        throw new Error(`重置所有术语失败: ${error.message}`);
    }
}
