'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Loader2 } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    // Simulate network request
    setTimeout(() => {
      router.push('/?loggedin=true');
    }, 1000);
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
                <div className="flex justify-center items-center gap-2 mb-2">
                    <BookOpen className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold text-primary">文词通</h1>
                </div>
                <p className="text-balance text-muted-foreground">
                    您的个人文学考研智能助手
                </p>
            </div>
            <form onSubmit={handleLogin}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                    <Label htmlFor="email">用户名</Label>
                    <Input id="email" type="email" placeholder="输入任意用户名" required defaultValue="user" />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">密码</Label>
                        </div>
                        <Input id="password" type="password" required defaultValue="password" />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '登录'}
                    </Button>
                </div>
            </form>
        </div>
      </div>
       <div className="hidden bg-muted lg:block">
        <Image
          src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1974&auto=format&fit=crop"
          alt="Image"
          width="1920"
          height="1080"
          data-ai-hint="library books"
          className="h-full w-full object-cover dark:brightness-[0.4]"
        />
      </div>
    </div>
  );
}
