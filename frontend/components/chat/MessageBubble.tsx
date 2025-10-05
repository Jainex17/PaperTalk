'use client';

import { Message, Source } from '@/types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const renderMessageWithCitations = (content: string, sources?: Source[]) => {
    if (!sources || sources.length === 0) {
      return <p className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{content}</p>;
    }

    const parts = content.split(/(\(Source \d+\))/g);

    return (
      <p className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
        {parts.map((part, index) => {
          const match = part.match(/\(Source (\d+)\)/);
          if (match) {
            const sourceIndex = parseInt(match[1]) - 1;
            const source = sources[sourceIndex];

            if (source) {
              return (
                <span key={index} className="group relative inline-block">
                  <sup className="text-primary cursor-help font-medium">[{match[1]}]</sup>
                  <span className="invisible group-hover:visible absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 max-w-[90vw] bg-popover text-popover-foreground text-xs rounded-lg p-3 shadow-lg border border-border z-50 pointer-events-auto">
                    <div className="font-semibold mb-1">{source.filename}</div>
                    <div className="text-muted-foreground line-clamp-6">{source.chunk_text}</div>
                  </span>
                </span>
              );
            }
          }
          return part;
        })}
      </p>
    );
  };

  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[89%] rounded-xl ${
          message.type === 'user'
            ? 'bg-primary text-primary-foreground py-2 px-5'
            : 'py-2'
        }`}
      >
        {message.type === 'user' ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{message.content}</p>
        ) : (
          renderMessageWithCitations(message.content, message.sources)
        )}
      </div>
    </div>
  );
}
