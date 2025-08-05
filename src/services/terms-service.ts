'use server';

import { db } from '@/lib/firebase';
import type { LiteraryTerm, LiteraryTermCreate } from '@/types';
import { collection, addDoc, getDocs, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

const TERMS_COLLECTION = 'literaryTerms';

export async function addTerm(termData: LiteraryTermCreate): Promise<LiteraryTerm> {
    const docRef = await addDoc(collection(db, TERMS_COLLECTION), {
        ...termData,
        createdAt: serverTimestamp(),
    });

    return {
        id: docRef.id,
        ...termData,
        createdAt: new Date(), // Approximate client-side date
    };
}

export async function getTerms(): Promise<LiteraryTerm[]> {
    const q = query(collection(db, TERMS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const terms: LiteraryTerm[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        terms.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
        } as LiteraryTerm);
    });
    return terms;
}

export async function updateTerm(id: string, termData: Partial<LiteraryTerm>): Promise<void> {
    const termRef = doc(db, TERMS_COLLECTION, id);
    // serverTimestamp cannot be used in update, so we exclude it if present
    const { createdAt, ...updateData } = termData;
    await updateDoc(termRef, updateData);
}
