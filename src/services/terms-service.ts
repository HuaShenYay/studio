'use server';

import { supabase } from '@/lib/supabase';
import type { LiteraryTerm, LiteraryTermCreate, TermGroup } from '@/types';
import type { Database, Tables } from '@/lib/supabase';

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
    answer: row.answer,
    isDifficult: row.isDifficult,
    status: row.status,
    userAnswer: row.userAnswer,
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

export async function updateTerm(id: number, termData: Partial<LiteraryTerm>): Promise<void> {
    const { id: termId, createdAt, groupName, ...rest } = termData;
    const supabaseData: LiteraryTermUpdate = {
        ...rest,
        group_name: groupName
    };

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
    // This will "delete" the group by un-assigning all terms from it.
    const { error } = await supabase
        .from(TERMS_TABLE)
        .update({ group_name: null })
        .eq('group_name', groupName);

    if (error) {
        console.error('Error deleting group: ', error);
        throw new Error(`删除分组失败: ${error.message}`);
    }
}

export async function resetAllTerms(): Promise<void> {
    const { error } = await supabase
        .from(TERMS_TABLE)
        .update({ status: 'unanswered', userAnswer: '' });
    
    if (error) {
        console.error('Error resetting terms:', error);
        throw new Error(`重置所有术语失败: ${error.message}`);
    }
}
