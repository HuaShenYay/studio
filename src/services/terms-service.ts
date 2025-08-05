'use server';

import { supabase } from '@/lib/supabase';
import type { LiteraryTerm, LiteraryTermCreate } from '@/types';
import type { Database, Tables } from '@/lib/supabase';

type LiteraryTermInsert = Database['public']['Tables']['literary_terms']['Insert'];
type LiteraryTermUpdate = Database['public']['Tables']['literary_terms']['Update'];

const TERMS_TABLE = 'literary_terms';

const fromSupabase = (row: Tables<'literary_terms'>): LiteraryTerm => ({
    ...row,
    createdAt: new Date(row.created_at),
});

const toSupabase = (term: Partial<LiteraryTerm> | LiteraryTermCreate): LiteraryTermInsert => {
    const { id, createdAt, ...rest } = term as LiteraryTerm;
    const supabaseData: LiteraryTermInsert = {
        term: rest.term!,
        explanation: rest.explanation!,
        exercise: rest.exercise!,
        answer: rest.answer!,
        isDifficult: rest.isDifficult || false,
        status: rest.status || 'unanswered',
        userAnswer: rest.userAnswer || '',
    };
    return supabaseData;
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
    const { data, error } = await supabase
        .from(TERMS_TABLE)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching terms:', error);
        return [];
    }

    return data.map(fromSupabase);
}

export async function updateTerm(id: number, termData: Partial<LiteraryTerm>): Promise<void> {
    const { id: termId, createdAt, ...rest } = termData;
    const supabaseData: LiteraryTermUpdate = {
        ...rest
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