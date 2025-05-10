"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Note } from '@/types';
import { summarizeNote } from '@/ai/flows/summarize-note';

export type ViewMode = 'edit' | 'preview';

interface NoteState {
  notes: Note[];
  activeNoteId: string | null;
  isLoadingSummary: boolean;
  isHydrated: boolean;
  viewMode: ViewMode;
  actions: {
    addNote: () => Note;
    setActiveNoteId: (id: string | null) => void;
    updateNote: (id: string, title: string, content: string) => void;
    deleteNote: (id: string) => void;
    generateSummary: (id: string) => Promise<string | null>;
    setHydrated: () => void;
    toggleViewMode: () => void;
    setViewMode: (mode: ViewMode) => void;
  };
}

const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: [],
      activeNoteId: null,
      isLoadingSummary: false,
      isHydrated: false,
      viewMode: 'edit',
      actions: {
        setHydrated: () => set({ isHydrated: true }),
        addNote: () => {
          const newNote: Note = {
            id: crypto.randomUUID(),
            title: 'New Note',
            content: '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          set((state) => ({
            notes: [newNote, ...state.notes],
          }));
          
          setTimeout(() => {
            set({ activeNoteId: newNote.id });
          }, 50);
          
          return newNote;
        },
        setActiveNoteId: (id) => set({ activeNoteId: id }),
        updateNote: (id, title, content) => {
          const noteExists = get().notes.some(note => note.id === id);
          if (!noteExists) return;
          
          set((state) => ({
            notes: state.notes.map((note) =>
              note.id === id ? { ...note, title, content, updatedAt: Date.now() } : note
            ),
          }));
        },
        deleteNote: (id) => {
          set((state) => ({
            notes: state.notes.filter((note) => note.id !== id),
            activeNoteId: state.activeNoteId === id ? null : state.activeNoteId,
          }));
        },
        generateSummary: async (id) => {
          const note = get().notes.find((n) => n.id === id);
          if (!note || !note.content) return null;

          set({ isLoadingSummary: true });
          try {
            const result = await summarizeNote({ note: note.content });
            set((state) => ({
              notes: state.notes.map((n) =>
                n.id === id ? { ...n, summary: result.summary } : n
              ),
              isLoadingSummary: false,
            }));
            return result.summary;
          } catch (error) {
            console.error('Failed to summarize note:', error);
            set({ isLoadingSummary: false });
            return null;
          }
        },
        toggleViewMode: () => {
          set((state) => ({
            viewMode: state.viewMode === 'edit' ? 'preview' : 'edit',
          }));
        },
        setViewMode: (mode) => {
          set({ viewMode: mode });
        }
      },
    }),
    {
      name: 'noteweave-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({ 
        notes: state.notes, 
        activeNoteId: state.activeNoteId,
        viewMode: state.viewMode
      }), // persist notes, activeNoteId, and viewMode
      onRehydrateStorage: () => (state) => {
        if (state) state.actions.setHydrated();
      },
    }
  )
);

// Export actions separately for easier usage in components
export const useNotes = () => useNoteStore((state) => state.notes);
export const useActiveNoteId = () => useNoteStore((state) => state.activeNoteId);
export const useIsLoadingSummary = () => useNoteStore((state) => state.isLoadingSummary);
export const useNoteActions = () => useNoteStore((state) => state.actions);
export const useIsHydrated = () => useNoteStore((state) => state.isHydrated);
export const useViewMode = () => useNoteStore((state) => state.viewMode);

export default useNoteStore;

