"use client";

import { AppHeader } from '@/components/layout/AppHeader';
import { NoteList } from '@/components/notes/NoteList';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { useIsHydrated, useNoteActions } from '@/store/noteStore';
import React, { useEffect } from 'react';

export default function HomePage() {
  const isHydrated = useIsHydrated();
  const { setHydrated } = useNoteActions(); // Get setHydrated from actions

  // Manually trigger hydration check if persist's onRehydrateStorage isn't enough
  useEffect(() => {
    if (typeof window !== 'undefined' && !isHydrated) {
      // This ensures that if persist middleware's rehydration callback for some reason
      // doesn't set isHydrated, we try to set it after client-side mount.
      // The store's onRehydrateStorage should ideally handle this.
      // This is a fallback.
      setHydrated(); 
    }
  }, [isHydrated, setHydrated]);


  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <AppHeader />
      <div className="flex flex-1 border-t border-border overflow-hidden">
        <aside className="w-64 md:w-72 lg:w-80 border-r border-border bg-card flex flex-col shrink-0">
          <NoteList />
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden">
          <NoteEditor />
        </main>
      </div>
    </div>
  );
}

