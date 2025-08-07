"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { TermGroup } from "@/types";
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';


type ManageGroupsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: TermGroup[];
  onRenameGroup: (oldName: string, newName: string) => Promise<void>;
  onDeleteGroup: (groupName: string) => Promise<void>;
};

export default function ManageGroupsDialog({
  open,
  onOpenChange,
  groups,
  onRenameGroup,
  onDeleteGroup,
}: ManageGroupsDialogProps) {
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const { toast } = useToast();

  const handleStartEditing = (group: TermGroup) => {
    setEditingGroup(group.groupName);
    setNewName(group.groupName);
  };

  const handleCancelEditing = () => {
    setEditingGroup(null);
    setNewName('');
  };

  const handleSaveRename = async () => {
    if (!editingGroup || !newName.trim() || newName === editingGroup) {
      handleCancelEditing();
      return;
    }

    if (groups.some(g => g.groupName.toLowerCase() === newName.trim().toLowerCase())) {
        toast({
            variant: "destructive",
            title: "名称已存在",
            description: "该分组名称已被使用，请输入一个不同的名称。"
        })
        return;
    }

    await onRenameGroup(editingGroup, newName.trim());
    handleCancelEditing();
  };
  
  const handleDelete = async (groupName: string) => {
    await onDeleteGroup(groupName);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>管理分组</DialogTitle>
          <DialogDescription>
            在这里重命名或删除您现有的分组。
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 w-full pr-6">
          <div className="grid gap-4 py-4">
            {groups.length > 0 ? groups.map((group) => (
              <div key={group.groupName} className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted/50">
                {editingGroup === group.groupName ? (
                   <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                    className="h-9"
                  />
                ) : (
                  <span className="font-medium truncate">{group.groupName} ({group.count})</span>
                )}
                <div className="flex items-center gap-1 shrink-0">
                  {editingGroup === group.groupName ? (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-600" onClick={handleSaveRename}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-600" onClick={handleCancelEditing}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStartEditing(group)}>
                         <Pencil className="h-4 w-4" />
                       </Button>
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                             </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确定要删除分组 “{group.groupName}” 吗？</AlertDialogTitle>
                              <AlertDialogDescription>
                                此操作无法撤销。分组下的所有术语将被设为“未分组”，但术语本身**不会**被删除。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(group.groupName)} className={cn(buttonVariants({ variant: "destructive" }))}>
                                删除分组
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            )) : (
                <div className="text-center text-muted-foreground py-10">
                    <p>没有可管理的分组。</p>
                </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">关闭</Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
