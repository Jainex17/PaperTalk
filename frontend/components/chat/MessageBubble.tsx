'use client';

import { Message, Source } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';
import { InlineCitation } from './InlineCitation';
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
    hr: ({ ...props }) => <hr className="my-4 border-border" {...props} />,
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
    if (!sources || sources.length === 0) {
      return (
        <div className="text-sm markdown-table">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {content}
          </ReactMarkdown>
        </div>
      );
    }

    // Group sources by filename for inline citations
    const groupedSources = groupSourcesByFilename(sources);

    // Extract citation references from content and create a map
    const citationMap = new Map<number, { filename: string; sources: Source[]; index: number }>();
    groupedSources.forEach((group) => {
      citationMap.set(group.index, group);
    });

    // Process content to replace citation markers with placeholders
    // Universal citation parser - handles any format with numbers
    const citationPositions = new Map<string, number[]>();
    let citationCounter = 0;
    let processedContent = content;

    // Universal regex that matches any citation-like pattern
    // Matches: [Source 1], [Source 1, Source 2], (Source 1), [cite:1,2,3], etc.
    const universalCitationRegex = /[\[\(]([^\[\]\(\)]+)[\]\)]/g;

    processedContent = processedContent.replace(universalCitationRegex, (match, content) => {
      // Check if this looks like a citation (contains "Source", "cite:", or just numbers)
      const isCitation = /(?:Source|cite:|^\s*\d+)/i.test(content);

      if (!isCitation) {
        return match; // Not a citation, keep original
      }

      // Extract all numbers from the matched text
      const sourceNumbers = content.match(/\d+/g)?.map(Number) || [];

      // Only treat as citation if we found valid numbers
      if (sourceNumbers.length > 0) {
        const placeholder = `__CITATION_${citationCounter}__`;
        citationPositions.set(placeholder, sourceNumbers);
        citationCounter++;
        return placeholder;
      }

      // If no valid numbers found, return original text
      return match;
    });

    // Extract citations from end of paragraphs only
    const paragraphs = processedContent.split('\n\n');
    const paragraphsWithCitations = paragraphs.map((para) => {
      // Find all citations in this paragraph
      const citations: number[] = [];
      const placeholderRegex = /__CITATION_(\d+)__/g;
      let match;

      while ((match = placeholderRegex.exec(para)) !== null) {
        const placeholder = match[0];
        const sourceNumbers = citationPositions.get(placeholder) || [];
        citations.push(...sourceNumbers);
      }

      // Remove all citation placeholders from paragraph
      let cleanPara = para.replace(/__CITATION_\d+__/g, '');

      // Fix spacing issues: remove extra spaces before punctuation
      cleanPara = cleanPara.replace(/\s+([.,!?;:])/g, '$1');

      // Fix multiple spaces
      cleanPara = cleanPara.replace(/\s+/g, ' ').trim();

      // Get unique citations
      const uniqueCitations = [...new Set(citations)];

      return { text: cleanPara, citations: uniqueCitations };
    });

    // Reconstruct content without placeholders
    const cleanContent = paragraphsWithCitations.map(p => p.text).join('\n\n');

    // Custom markdown components with inline citation rendering
    let currentParagraphIndex = -1;

    const markdownComponentsWithCitations = {
      ...markdownComponents,
      p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
        currentParagraphIndex++;
        const paraData = paragraphsWithCitations[currentParagraphIndex] || { text: '', citations: [] };

        return (
          <p className="my-2 leading-relaxed text-foreground" {...props}>
            {children}
            {paraData.citations.length > 0 && (
              <span className="inline">
                <span className="citation-nbsp"> </span>
                {paraData.citations.map((sourceNum) => {
                  const citationInfo = citationMap.get(sourceNum);
                  if (citationInfo) {
                    return (
                      <InlineCitation
                        key={`citation-${currentParagraphIndex}-${sourceNum}`}
                        filename={citationInfo.filename}
                        sources={citationInfo.sources}
                        onClick={() => handleViewFullText(citationInfo.filename, citationInfo.sources, citationInfo.index)}
                      />
                    );
                  }
                  return null;
                })}
              </span>
            )}
          </p>
        );
      },
    };

    return (
      <div className="text-sm markdown-table">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponentsWithCitations}
        >
          {cleanContent}
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
