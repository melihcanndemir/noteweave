"use client";

import type { Note } from '@/types';
import { useNoteActions, useActiveNoteId } from '@/store/noteStore';
import { Button } from '@/components/ui/button';
import { Trash2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NoteItemProps {
  note: Note;
}

export function NoteItem({ note }: NoteItemProps) {
  const { setActiveNoteId, deleteNote } = useNoteActions();
  const activeNoteId = useActiveNoteId();

  const isActive = note.id === activeNoteId;

  const handleSelect = () => {
    setActiveNoteId(note.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection when deleting
    deleteNote(note.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={(e) => e.key === 'Enter' && handleSelect()}
      className={cn(
        "group flex items-center justify-between p-3 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
        isActive && "bg-primary/10 text-primary"
      )}
    >
      <div className="flex items-center overflow-hidden">
        <FileText className={cn("h-5 w-5 mr-3 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
        <div className="truncate">
          <p className={cn("font-medium text-sm truncate", isActive && "text-primary font-semibold")}>
            {note.title || "Untitled Note"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={handleDelete}
        aria-label={`Delete note ${note.title}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
