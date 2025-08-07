'use server';

import { supabase } from '@/lib/supabase';
import type { LiteraryTerm, LiteraryTermCreate, TermGroup } from '@/types';
import type { Database, Tables } from '@/lib/supabase';

type LiteraryTermRow = Tables<'literary_terms'>;
type LiteraryTermInsert = Database['public']['Tables']['literary_terms']['Insert'];
type LiteraryTermUpdate = Database['public']['Tables']['literary_terms']['Update'];

const TERMS_TABLE = 'literary_terms';
const PDF_BUCKET = 'pdfs';

const fromSupabase = (row: LiteraryTermRow): LiteraryTerm => ({
    ...row,
    createdAt: new Date(row.created_at),
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

export async function uploadPdf(file: File): Promise<{ publicUrl: string }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
        .from(PDF_BUCKET)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error('Error uploading file:', error);
        throw new Error(`文件上传失败: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
        .from(PDF_BUCKET)
        .getPublicUrl(data.path);

    return { publicUrl };
}

export async function listPdfs() {
    const { data, error } = await supabase.storage.from(PDF_BUCKET).list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) {
        console.error('Error listing files:', error);
        throw new Error(`获取文件列表失败: ${error.message}`);
    }
    
    const filesWithUrls = data.map(file => {
        const { data: { publicUrl } } = supabase.storage.from(PDF_BUCKET).getPublicUrl(file.name);
        return { ...file, publicUrl };
    });

    return filesWithUrls;
}

export async function deletePdf(fileName: string): Promise<void> {
    const { error } = await supabase.storage
        .from(PDF_BUCKET)
        .remove([fileName]);
    
    if (error) {
        console.error('Error deleting file:', error);
        throw new Error(`删除文件失败: ${error.message}`);
    }
}


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
