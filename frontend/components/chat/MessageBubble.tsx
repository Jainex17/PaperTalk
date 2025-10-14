'use client';

import { Message, Source } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';
import { CitationCard } from './CitationCard';
import { CitationModal } from './CitationModal';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [selectedSources, setSelectedSources] = useState<Source[]>([]);
  const [selectedFilename, setSelectedFilename] = useState<string>('');
  const [selectedCitationNumber, setSelectedCitationNumber] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Group sources by filename
  const groupSourcesByFilename = (sources: Source[]) => {
    const grouped = new Map<string, Source[]>();
    sources.forEach((source) => {
      const existing = grouped.get(source.filename) || [];
      grouped.set(source.filename, [...existing, source]);
    });
    return Array.from(grouped.entries()).map(([filename, sources], index) => ({
      filename,
      sources,
      index: index + 1,
      // Use the highest relevance score
      relevance_score: sources.reduce((max, s) => Math.max(max, typeof s.relevance_score === 'number' ? s.relevance_score : 0), 0)
    }));
  };

  const handleViewFullText = (filename: string, sources: Source[], index: number) => {
    setSelectedFilename(filename);
    setSelectedSources(sources);
    setSelectedCitationNumber(index);
    setIsModalOpen(true);
  };

  const markdownComponents = {
    h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-4 mb-2 text-foreground" {...props} />,
    h2: ({ ...props }) => <h2 className="text-xl font-bold mt-3 mb-2 text-foreground" {...props} />,
    h3: ({ ...props }) => <h3 className="text-lg font-bold mt-2 mb-1 text-foreground" {...props} />,
    strong: ({ ...props }) => <strong className="font-bold text-foreground" {...props} />,
    ul: ({ ...props }) => <ul className="list-disc ml-5 my-2 space-y-1" {...props} />,
    ol: ({ ...props }) => <ol className="list-decimal ml-5 my-2 space-y-1" {...props} />,
    li: ({ ...props }) => <li className="leading-relaxed text-foreground" {...props} />,
    p: ({ ...props }) => <p className="leading-relaxed mb-2 text-foreground" {...props} />,
    table: ({ ...props }) => (
      <div className="overflow-x-auto my-4">
        <table {...props} />
      </div>
    ),
    thead: ({ ...props }) => <thead {...props} />,
    tbody: ({ ...props }) => <tbody {...props} />,
    tr: ({ ...props }) => <tr {...props} />,
    th: ({ ...props }) => <th {...props} />,
    td: ({ ...props }) => <td {...props} />,
    code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement> & { className?: string }) => {
      const isInline = !className;
      return isInline ? (
        <code className="bg-muted text-foreground px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      ) : (
        <code className={`${className} block bg-muted text-foreground p-3 rounded-lg text-sm overflow-x-auto font-mono my-2`} {...props}>
          {children}
        </code>
      );
    },
  };

  const renderMessageWithCitations = (content: string, sources?: Source[]) => {
    // Remove inline source citations like "(Source 1)", "(Source 1, Source 4)", etc.
    const cleanedContent = content.replace(/\(Source \d+(?:,\s*Source \d+)*\)/g, '').trim();

    if (!sources || sources.length === 0) {
      return (
        <div className="text-sm markdown-table">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {cleanedContent}
          </ReactMarkdown>
        </div>
      );
    }

    return (
      <div className="text-sm markdown-table">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {cleanedContent}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[89%] flex flex-col gap-3">
        <div
          className={`rounded-xl ${
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

        {/* Citation Cards - only show for assistant messages with sources */}
        {message.type === 'assistant' && message.sources && message.sources.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            {groupSourcesByFilename(message.sources).map((group) => (
              <CitationCard
                key={group.filename}
                filename={group.filename}
                sources={group.sources}
                index={group.index}
                relevanceScore={group.relevance_score}
                onViewFullText={() => handleViewFullText(group.filename, group.sources, group.index)}
              />
            ))}
          </div>
        )}

        {/* Citation Modal */}
        <CitationModal
          filename={selectedFilename}
          sources={selectedSources}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          citationNumber={selectedCitationNumber}
        />
      </div>
    </div>
  );
}
