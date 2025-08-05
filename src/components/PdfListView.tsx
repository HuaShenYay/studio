"use client";

import React, { useEffect, useState } from 'react';
import { listPdfs } from '@/services/terms-service';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FolderOpen, FileText, ExternalLink, Trash2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface PdfFile {
    id: string;
    name: string;
    created_at: string;
    publicUrl: string;
}

export default function PdfListView() {
    const [files, setFiles] = useState<PdfFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchFiles = async () => {
        setIsLoading(true);
        try {
            const fetchedFiles = await listPdfs();
            setFiles(fetchedFiles.map(f => ({...f, created_at: f.created_at})));
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

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleOpenFile = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

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
                        <Card key={file.id}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <FileText className="h-8 w-8 text-primary/70 shrink-0" />
                                    <div className='overflow-hidden'>
                                        <p className="font-semibold truncate" title={file.name}>{file.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(file.created_at), { addSuffix: true, locale: zhCN })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleOpenFile(file.publicUrl)}
                                    >
                                        <ExternalLink className="h-5 w-5 text-muted-foreground hover:text-primary"/>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
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