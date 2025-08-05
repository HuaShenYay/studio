"use client";

import React, { useEffect, useState } from 'react';
import { listPdfs, deletePdf } from '@/services/terms-service';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FolderOpen, FileText, ExternalLink, Trash2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
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
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger } from './ui/tooltip';


interface PdfFile {
    id: string;
    name: string;
    created_at: string;
    publicUrl: string;
}

function PdfCard({ file, onDelete }: { file: PdfFile; onDelete: (fileName: string) => void; }) {
    const [formattedDate, setFormattedDate] = useState<string | null>(null);

    useEffect(() => {
        setFormattedDate(
            formatDistanceToNow(new Date(file.created_at), { addSuffix: true, locale: zhCN })
        );
    }, [file.created_at]);

    const handleOpenFile = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };
    
    const handleDelete = () => {
        onDelete(file.name);
    }

    return (
        <Card>
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 overflow-hidden">
                    <FileText className="h-8 w-8 text-primary/70 shrink-0" />
                    <div className='overflow-hidden'>
                        <p className="font-semibold truncate" title={file.name}>{file.name}</p>
                        <p className="text-sm text-muted-foreground h-5">
                            {formattedDate ? formattedDate : <span className="animate-pulse">计算中...</span>}
                        </p>
                    </div>
                </div>
                <div className="flex items-center shrink-0">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenFile(file.publicUrl)}
                                >
                                    <ExternalLink className="h-5 w-5 text-muted-foreground hover:text-primary"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>在新标签页中打开</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                     <AlertDialog>
                      <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" aria-label="删除文件">
                                        <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive"/>
                                    </Button>
                                </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>删除文件</p>
                            </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>您确定要删除此文件吗？</AlertDialogTitle>
                          <AlertDialogDescription>
                            此操作无法撤销。这将从云端存储中永久删除文件 “<strong>{file.name}</strong>”。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className={cn(buttonVariants({ variant: "destructive" }))}>删除</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}

export default function PdfListView() {
    const [files, setFiles] = useState<PdfFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchFiles = async () => {
        setIsLoading(true);
        try {
            const fetchedFiles = await listPdfs();
            setFiles(fetchedFiles);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '一个未知错误发生了。';
            toast({
                variant: "destructive",
                title: "加载文件列表失败",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeleteFile = async (fileName: string) => {
        try {
            await deletePdf(fileName);
            toast({
                title: "文件已删除",
                description: `文件 ${fileName} 已被成功删除。`
            });
            fetchFiles(); // Refresh the list after deletion
        } catch (error) {
             const errorMessage = error instanceof Error ? error.message : '一个未知错误发生了。';
            toast({
                variant: "destructive",
                title: "删除文件失败",
                description: errorMessage,
            });
        }
    }

    useEffect(() => {
        fetchFiles();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground py-12 rounded-xl bg-card h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-lg">正在加载云端文件列表...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <FolderOpen className="h-8 w-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-foreground">我的文件</h2>
                    <p className="text-muted-foreground">管理您已上传的 PDF 文档。</p>
                </div>
            </div>
            
            {files.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {files.map((file) => (
                        <PdfCard key={file.id} file={file} onDelete={handleDeleteFile} />
                    ))}
                </div>
            ) : (
                 <div className="text-center text-muted-foreground py-16 rounded-xl bg-card">
                    <p className="text-lg font-medium">您的文件库是空的</p>
                    <p className="mt-2 text-sm">通过“添加术语”页面上传 PDF 文件以在此处查看。</p>
                </div>
            )}
        </div>
    );
}
