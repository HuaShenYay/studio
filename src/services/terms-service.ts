'use server';

import { supabase } from '@/lib/supabase';
import type { LiteraryTerm, LiteraryTermCreate } from '@/types';
import type { Tables } from '@/lib/supabase';

const TERMS_TABLE = 'literary_terms';

const fromSupabase = (row: Tables<'literary_terms'>): LiteraryTerm => ({
    ...row,
    createdAt: new Date(row.created_at),
});

// This function now correctly handles both creation and updates.
const toSupabase = (term: Partial<LiteraryTerm> | LiteraryTermCreate) => {
    const supabaseData: Omit<Tables<'literary_terms'>, 'id' | 'created_at'> = {
        term: term.term!,
        explanation: term.explanation!,
        exercise: term.exercise!,
        answer: term.answer!,
        isDifficult: term.isDifficult || false,
        status: term.status || 'unanswered',
        userAnswer: term.userAnswer || '',
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
    // We can't just use toSupabase here because it requires fields that might be missing in a partial update.
    const { createdAt, term, ...rest } = termData;
    const supabaseData: Partial<Omit<Tables<'literary_terms'>, 'id' | 'created_at'>> = {
        ...rest
    };
     if (term) supabaseData.term = term;

    const { error } = await supabase
        .from(TERMS_TABLE)
        .update(supabaseData)
        .eq('id', id);

    if (error) {
        console.error('Error updating term:', error);
        throw new Error(`更新术语失败: ${error.message}`);
    }
}
