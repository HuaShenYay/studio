'use server';

import { supabase } from '@/lib/supabase';
import type { LiteraryTerm, LiteraryTermCreate } from '@/types';
import type { Database, Tables } from '@/lib/supabase';

type LiteraryTermRow = Tables<'literary_terms'>;
type LiteraryTermInsert = Database['public']['Tables']['literary_terms']['Insert'];
type LiteraryTermUpdate = Database['public']['Tables']['literary_terms']['Update'];

const TERMS_TABLE = 'literary_terms';
const PDF_BUCKET = 'pdfs';

const fromSupabase = (row: LiteraryTermRow): LiteraryTerm => ({
    ...row,
    createdAt: new Date(row.created_at),
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