'use client';

import { Message, Source } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useRef } from 'react';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
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
    code: ({ className, children, ...props }: any) => {
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

    // Custom component for inline citations
    const Citation = ({ sourceNum }: { sourceNum: string }) => {
      const sourceIndex = parseInt(sourceNum) - 1;
      const source = sources[sourceIndex];
      const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
      const [isVisible, setIsVisible] = useState(false);
      const citationRef = useRef<HTMLSpanElement>(null);

      if (!source) return null;

      const handleMouseEnter = () => {
        if (citationRef.current) {
          const rect = citationRef.current.getBoundingClientRect();
          const tooltipWidth = 320; // w-80 = 320px
          const viewportWidth = window.innerWidth;

          // Calculate left position to keep tooltip in viewport
          let left = rect.left + rect.width / 2;

          // If tooltip would go off right edge, align it to right edge
          if (left + tooltipWidth / 2 > viewportWidth - 20) {
            left = viewportWidth - tooltipWidth / 2 - 20;
          }

          // If tooltip would go off left edge, align it to left edge
          if (left - tooltipWidth / 2 < 20) {
            left = tooltipWidth / 2 + 20;
          }

          setTooltipPosition({
            top: rect.bottom + window.scrollY + 8,
            left: left,
          });
          setIsVisible(true);
        }
      };

      const handleMouseLeave = () => {
        setIsVisible(false);
      };

      return (
        <>
          <span
            ref={citationRef}
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <sup className="text-primary cursor-help font-medium">[{sourceNum}]</sup>
          </span>
          {isVisible && (
            <div
              className="fixed w-80 max-w-[90vw] bg-popover text-popover-foreground text-xs rounded-lg p-3 shadow-lg border border-border z-[9999] transform -translate-x-1/2"
              style={{
                top: `${tooltipPosition.top}px`,
                left: `${tooltipPosition.left}px`,
              }}
            >
              <div className="font-semibold mb-1">{source.filename}</div>
              <div className="text-muted-foreground line-clamp-6">{source.chunk_text}</div>
            </div>
          )}
        </>
      );
    };

    // Enhanced markdown components with citation support
    const componentsWithCitations = {
      ...markdownComponents,
      p: ({ children, ...props }: any) => {
        // Process children to find and replace citations
        const processChildren = (child: any): any => {
          if (typeof child === 'string') {
            const parts = child.split(/(\(Source \d+\))/g);
            return parts.map((part, i) => {
              const match = part.match(/\(Source (\d+)\)/);
              if (match) {
                return <Citation key={`cite-${i}`} sourceNum={match[1]} />;
              }
              return part;
            });
          }
          return child;
        };

        const processedChildren = Array.isArray(children)
          ? children.map(processChildren)
          : processChildren(children);

        return <p className="leading-relaxed mb-2 text-foreground" {...props}>{processedChildren}</p>;
      },
      li: ({ children, ...props }: any) => {
        // Process children to find and replace citations
        const processChildren = (child: any): any => {
          if (typeof child === 'string') {
            const parts = child.split(/(\(Source \d+\))/g);
            return parts.map((part, i) => {
              const match = part.match(/\(Source (\d+)\)/);
              if (match) {
                return <Citation key={`cite-${i}`} sourceNum={match[1]} />;
              }
              return part;
            });
          }
          return child;
        };

        const processedChildren = Array.isArray(children)
          ? children.map(processChildren)
          : processChildren(children);

        return <li className="leading-relaxed text-foreground" {...props}>{processedChildren}</li>;
      },
    };

    return (
      <div className="text-sm markdown-table">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={componentsWithCitations}
        >
          {content}
        </ReactMarkdown>
      </div>
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
