"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  useNotes,
  useActiveNoteId,
  useNoteActions,
  useIsLoadingSummary,
  useIsHydrated,
  useViewMode,
  type ViewMode,
} from "@/store/noteStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  Wand2,
  Loader2,
  Info,
  AlignLeft,
  Edit,
  Eye,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
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
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotePreview } from "./NotePreview";

const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};

export function NoteEditor() {
  const notes = useNotes();
  const activeNoteId = useActiveNoteId();
  const viewMode = useViewMode();
  const { updateNote, generateSummary, setViewMode, toggleViewMode } =
    useNoteActions();
  const isLoadingSummary = useIsLoadingSummary();
  const isHydrated = useIsHydrated();
  const { toast } = useToast();

  const activeNote = React.useMemo(
    () => notes.find((note) => note.id === activeNoteId),
    [notes, activeNoteId]
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<string | null>(null);
  const [isUserEditing, setIsUserEditing] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const debouncedUpdateNote = useCallback(
    debounce((id: string, title: string, content: string) => {
      updateNote(id, title, content);
    }, 500),
    [updateNote]
  );

  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
      setCurrentSummary(activeNote.summary || null);
      setIsUserEditing(false);
    } else {
      setTitle("");
      setContent("");
      setCurrentSummary(null);
      setIsUserEditing(false);
    }
  }, [activeNote?.id]); // Only trigger when the actual note ID changes, not its contents

  useEffect(() => {
    if (!activeNote || !isUserEditing) return;

    const timer = setTimeout(() => {
      if (title !== activeNote.title || content !== activeNote.content) {
        debouncedUpdateNote(activeNote.id, title, content);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [title, content, activeNote, debouncedUpdateNote, isUserEditing]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUserEditing(true);
    setTitle(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIsUserEditing(true);
    setContent(e.target.value);
  };

  const handleFormat = (formatType: "bold" | "italic" | "underline") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    setIsUserEditing(true);
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let formattedText = "";

    switch (formatType) {
      case "bold":
        formattedText = `**${selectedText}**`;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        break;
      case "underline":
        formattedText = `<u>${selectedText}</u>`;
        break;
    }

    const newContent =
      content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    // Focus and update selection if needed, though this can be complex
    // For simplicity, we'll let the user re-adjust cursor
  };

  const handleSummarize = async () => {
    if (!activeNote || !activeNote.content) {
      toast({
        title: "Cannot Summarize",
        description: "Note content is empty.",
        variant: "destructive",
      });
      return;
    }
    const summary = await generateSummary(activeNote.id);
    if (summary) {
      setCurrentSummary(summary);
      setSummaryDialogOpen(true);
      toast({
        title: "Summary Generated",
        description: "The note summary has been created.",
      });
    } else {
      toast({
        title: "Summarization Failed",
        description: "Could not generate summary for the note.",
        variant: "destructive",
      });
    }
  };

  const handleViewModeChange = (value: string) => {
    setViewMode(value as ViewMode);
  };

  if (!isHydrated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground bg-muted/20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading your notes...</p>
      </div>
    );
  }

  if (!activeNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-muted/10">
        <AlignLeft className="h-16 w-16 text-primary/50 mb-6" />
        <h2 className="text-2xl font-semibold mb-2">No Note Selected</h2>
        <p>
          Select a note from the list on the left, or create a new one to start
          writing.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <div className="p-4 border-b border-border space-y-2">
        <Input
          placeholder="Note Title"
          value={title}
          onChange={handleTitleChange}
          className="text-lg font-semibold border-0 shadow-none focus-visible:ring-0 px-1 h-auto py-1"
          aria-label="Note title"
          onBlur={() => {
            if (!title.trim()) {
              setTitle(activeNote.title || "Untitled");
            }
          }}
        />
        <div className="flex items-center space-x-1">
          <Tabs
            value={viewMode}
            onValueChange={handleViewModeChange}
            className="mr-2"
          >
            <TabsList>
              <TabsTrigger value="edit" className="flex items-center gap-1">
                <Edit className="h-3.5 w-3.5" />
                <span>Edit</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>Preview</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {viewMode === "edit" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleFormat("bold")}
                aria-label="Bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleFormat("italic")}
                aria-label="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleFormat("underline")}
                aria-label="Underline"
              >
                <Underline className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-2" />
            </>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isLoadingSummary || !activeNote.content}
                onClick={handleSummarize}
              >
                {isLoadingSummary ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Summarize
              </Button>
            </AlertDialogTrigger>
            {/* Dialog will be controlled by summaryDialogOpen state */}
          </AlertDialog>
          {activeNote.summary && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentSummary(activeNote.summary || null);
                setSummaryDialogOpen(true);
              }}
            >
              <Info className="mr-2 h-4 w-4" />
              View Summary
            </Button>
          )}
        </div>
      </div>

      {viewMode === "edit" ? (
        <ScrollArea className="flex-1">
          <Textarea
            ref={textareaRef}
            placeholder="Start writing your note here..."
            value={content}
            onChange={handleContentChange}
            className="w-full h-full p-4 text-base border-0 shadow-none focus-visible:ring-0 resize-none min-h-[calc(100vh-200px)]"
            aria-label="Note content"
          />
        </ScrollArea>
      ) : (
        <NotePreview content={content} />
      )}

      {/* Summary Dialog */}
      <AlertDialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Note Summary</AlertDialogTitle>
            <AlertDialogDescription className="max-h-[60vh] overflow-y-auto py-2">
              {currentSummary || "No summary available."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSummaryDialogOpen(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
