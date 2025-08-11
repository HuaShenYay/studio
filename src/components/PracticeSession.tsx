
"use client";

import type { LiteraryTerm, TermGroup } from "@/types";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ExerciseCard from "@/components/ExerciseCard";
import { BrainCircuit, BookCopy, Settings, PlusSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ManageGroupsDialog from "./ManageGroupsDialog";
import { createGroupIfNotExists } from "@/services/terms-service";
import { Button } from "./ui/button";
import AddTermDialog from "./AddTermDialog";

type PracticeSessionProps = {
    terms: LiteraryTerm[];
    onUpdateTerm: (term: LiteraryTerm) => void;
    onDeleteTerm: (id: number) => void;
    getGroups: () => Promise<TermGroup[]>;
    onRenameGroup: (oldName: string, newName: string) => Promise<void>;
    onDeleteGroup: (groupName: string) => Promise<void>;
    onAddTerm: (term: string, explanation: string, groupName: string | null) => Promise<boolean>;
    isAddingTerm: boolean;
    onImported: () => Promise<void>;
}

export default function PracticeSession({ 
    terms, 
    onUpdateTerm, 
    onDeleteTerm, 
    getGroups,
    onRenameGroup,
    onDeleteGroup,
    onAddTerm,
    isAddingTerm,
    onImported,
}: PracticeSessionProps) {
    const [groups, setGroups] = useState<TermGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string>('all');
    const [isManageGroupsOpen, setIsManageGroupsOpen] = useState(false);
    const [isAddTermOpen, setIsAddTermOpen] = useState(false);
    const { toast } = useToast();

    const getLocalGroups = (): string[] => {
        try {
            const raw = localStorage.getItem('customGroups');
            if (!raw) return [];
            const arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr.filter((s) => typeof s === 'string' && s.trim() !== '').map((s) => s.trim()) : [];
        } catch {
            return [];
        }
    };

    const setLocalGroups = (names: string[]) => {
        const unique = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));
        localStorage.setItem('customGroups', JSON.stringify(unique));
    };

    const getGroupsMerged = useCallback(async (): Promise<TermGroup[]> => {
        const server = await getGroups();
        const local = getLocalGroups();
        const map = new Map<string, number>(server.map(g => [g.groupName, g.count]));
        for (const name of local) {
            if (!map.has(name)) map.set(name, 0);
        }
        return Array.from(map.entries()).map(([groupName, count]) => ({ groupName, count }));
    }, [getGroups]);

    const fetchGroups = useCallback(async () => {
        try {
            const fetchedGroups = await getGroupsMerged();
            setGroups(fetchedGroups);
        } catch (error) {
            console.error("Failed to fetch groups:", error);
            const errorMessage = error instanceof Error ? error.message : '一个未知错误发生了。';
            toast({
                variant: "destructive",
                title: "加载小组失败",
                description: `无法从服务器获取小组列表: ${errorMessage}`,
            });
        }
    }, [getGroupsMerged, toast]);

    useEffect(() => {
        fetchGroups();
    }, [terms, fetchGroups]); 

    const filteredTerms = useMemo(() => {
        if (selectedGroup === 'all') {
            return terms;
        }
        return terms.filter(term => term.groupName === selectedGroup);
    }, [terms, selectedGroup]);
    
    const reviewTerms = filteredTerms.filter(term => term.isDifficult);
    const displayedTerms = (tab: 'all' | 'review') => tab === 'all' ? filteredTerms : reviewTerms;

    const renderTermList = (termList: LiteraryTerm[], emptyMessage: { title: string, description: string }) => {
        if (termList.length > 0) {
            return (
                <div className="space-y-4">
                    {termList.map(term => (
                        <ExerciseCard key={term.id} termData={term} onUpdate={onUpdateTerm} onDelete={onDeleteTerm} groups={groups} mode="learn" />
                    ))}
                </div>
            );
        }
        return (
            <div className="text-center text-muted-foreground py-12 rounded-xl bg-card">
                <p className="text-lg font-medium">{emptyMessage.title}</p>
                <p className="mt-2 text-sm">{emptyMessage.description}</p>
            </div>
        );
    };

    return (
        <>
        <div className="h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 px-1">
                 <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <BrainCircuit className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-foreground">学习模式</h2>
                        <p className="text-muted-foreground">直接展示答案，专注于管理与记忆梳理（编辑术语/描述、修改分组、标记复习）。</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                 <Button onClick={() => setIsAddTermOpen(true)}>
                    <PlusSquare className="mr-2 h-4 w-4" />
                    添加新术语
                 </Button>
                 </div>
            </div>
             <div className="flex items-center gap-2 mb-6">
                <BookCopy className="h-5 w-5 text-muted-foreground" />
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger className="w-full sm:w-[200px] bg-background">
                        <SelectValue placeholder="选择一个小组" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">所有分组 ({terms.length})</SelectItem>
                        {groups.map(group => (
                            <SelectItem key={group.groupName} value={group.groupName}>
                                {group.groupName} ({group.count})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                    <Button variant="ghost" size="icon" onClick={() => setIsManageGroupsOpen(true)}>
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">管理分组</span>
                    </Button>
            </div>
            <Tabs defaultValue="all" className="w-full flex-grow">
                <TabsList className="grid w-full grid-cols-2 bg-primary/10 p-1 h-auto">
                    <TabsTrigger value="all" className="py-2 data-[state=active]:bg-background data-[state=active]:text-foreground">全部术语 ({filteredTerms.length})</TabsTrigger>
                    <TabsTrigger value="review" className="py-2 data-[state=active]:bg-background data-[state=active]:text-foreground">复习列表 ({reviewTerms.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-6">
                    {renderTermList(displayedTerms('all'), { 
                        title: "这个小组没有术语。", 
                        description: "请添加一些术语，或切换到别的小组。"
                    })}
                </TabsContent>
                <TabsContent value="review" className="mt-6">
                    {renderTermList(displayedTerms('review'), {
                        title: "复习列表是空的。",
                        description: "将小组中的术语标记为星号以在此处复习。"
                    })}
                </TabsContent>
            </Tabs>
        </div>
        <ManageGroupsDialog
            open={isManageGroupsOpen}
            onOpenChange={setIsManageGroupsOpen}
            groups={groups}
            onRenameGroup={async (oldName, newName) => {
                const target = groups.find(g => g.groupName === oldName);
                if (target && target.count === 0) {
                    const locals = getLocalGroups();
                    const updated = locals.map(n => n === oldName ? newName : n);
                    setLocalGroups(updated);
                    await fetchGroups();
                    return;
                }
                await onRenameGroup(oldName, newName);
                await fetchGroups();
            }}
            onDeleteGroup={async (name) => {
                const target = groups.find(g => g.groupName === name);
                if (target && target.count === 0) {
                    const locals = getLocalGroups().filter(n => n !== name);
                    setLocalGroups(locals);
                    await fetchGroups();
                    return;
                }
                await onDeleteGroup(name);
                await fetchGroups();
            }}
            onCreateGroup={async (name) => {
                const locals = getLocalGroups();
                if (!locals.includes(name)) {
                    setLocalGroups([...locals, name]);
                }
                await createGroupIfNotExists(name);
                await fetchGroups();
            }}
        />
        <AddTermDialog
            open={isAddTermOpen}
            onOpenChange={setIsAddTermOpen}
            onAddTerm={onAddTerm}
            isLoading={isAddingTerm}
            getGroups={getGroupsMerged}
        />
        </>
    )
}
