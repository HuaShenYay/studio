// @/components/AppLayout.tsx
"use client";

import React from 'react';
import Header from './Header';

type View = 'practice' | 'add' | 'analysis';

interface AppLayoutProps {
    children: React.ReactNode;
    currentView: View;
    setCurrentView: (view: View) => void;
    onLogout: () => void;
}

export default function AppLayout({ children, currentView, setCurrentView, onLogout }: AppLayoutProps) {
    return (
        <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
            <Header currentView={currentView} setCurrentView={setCurrentView} onLogout={onLogout}/>
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
