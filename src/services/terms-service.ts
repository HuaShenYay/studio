'use server';

import { supabase } from '@/lib/supabase';
import type { LiteraryTerm, LiteraryTermCreate } from '@/types';
import type { Tables } from '@/lib/supabase';

const TERMS_TABLE = 'literary_terms';

const fromSupabase = (row: Tables<'literary_terms'>): LiteraryTerm => ({
    ...row,
    createdAt: new Date(row.created_at),
});

const toSupabase = (term: Partial<LiteraryTerm>): Partial<Tables<'literary_terms'>> => {
    const { createdAt, ...rest } = term;
    return rest;
};

export async function addTerm(termData: LiteraryTermCreate): Promise<LiteraryTerm> {
    const { data, error } = await supabase
        .from(TERMS_TABLE)
        .insert(toSupabase(termData) as any)
        .select()
        .single();

    if (error) {
        console.error('Error adding term:', error);
        throw new Error('Failed to add term to Supabase.');
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
    const { error } = await supabase
        .from(TERMS_TABLE)
        .update(toSupabase(termData) as any)
        .eq('id', id);

    if (error) {
        console.error('Error updating term:', error);
        throw new Error('Failed to update term in Supabase.');
    }
}
