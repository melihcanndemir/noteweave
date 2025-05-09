"use client";

import { useNotes, useNoteActions, useIsHydrated } from '@/store/noteStore';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen } from 'lucide-react';
import { NoteItem } from './NoteItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

export function NoteList() {
  const notes = useNotes();
  const { addNote } = useNoteActions();
  const isHydrated = useIsHydrated();

  if (!isHydrated) {
    return (
      <div className="p-4 space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <Button onClick={addNote} className="w-full" variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {notes.length === 0 ? (
            <div className="text-center text-muted-foreground p-8 space-y-2">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-sm">No notes yet.</p>
              <p className="text-xs">Click "New Note" to get started.</p>
            </div>
          ) : (
            notes.map((note) => <NoteItem key={note.id} note={note} />)
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

