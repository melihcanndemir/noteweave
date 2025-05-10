"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotePreviewProps {
  content: string;
  className?: string;
}

export function NotePreview({ content, className = "" }: NotePreviewProps) {
  return (
    <ScrollArea className={`flex-1 ${className}`}>
      <div className="prose dark:prose-invert max-w-none p-4">
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          components={{
            // Custom component renderers for Markdown elements
            strong: ({ node, ...props }) => (
              <span className="font-bold" {...props} />
            ),
            em: ({ node, ...props }) => <span className="italic" {...props} />,
            u: ({ node, ...props }) => (
              <span className="underline" {...props} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </ScrollArea>
  );
}
