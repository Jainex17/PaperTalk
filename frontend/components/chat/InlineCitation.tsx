'use client';

import { Source } from '@/types';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface InlineCitationProps {
  filename: string;
  sources: Source[];
  onClick: () => void;
}

export function InlineCitation({ filename, sources, onClick }: InlineCitationProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [position, setPosition] = useState<'center' | 'left' | 'right'>('center');
  const [verticalPosition, setVerticalPosition] = useState<'top' | 'bottom'>('top');
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Get preview text from the first source
  const getPreviewText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return truncated.substring(0, lastSpace) + '...';
  };

  // Get short filename (remove extension)
  const getShortFilename = (name: string) => {
    return name.replace(/\.[^/.]+$/, '');
  };

  const previewText = sources.length > 0 ? getPreviewText(sources[0].chunk_text) : '';
  const shortFilename = getShortFilename(filename);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate optimal tooltip position when hovering
  useEffect(() => {
    if (isHovered && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const tooltipWidth = 256; // w-64 = 16rem = 256px
      const tooltipHeight = 200; // Approximate height
      const viewportWidth = window.innerWidth;

      // Calculate horizontal position
      let left = buttonRect.left + buttonRect.width / 2;

      if (left - tooltipWidth / 2 < 10) {
        setPosition('left');
        left = buttonRect.left;
      } else if (left + tooltipWidth / 2 > viewportWidth - 10) {
        setPosition('right');
        left = buttonRect.right;
      } else {
        setPosition('center');
      }

      // Calculate vertical position
      let top;
      if (buttonRect.top < tooltipHeight + 20) {
        setVerticalPosition('bottom');
        top = buttonRect.bottom + 8;
      } else {
        setVerticalPosition('top');
        top = buttonRect.top - 8;
      }

      setTooltipPosition({ top, left });
    }
  }, [isHovered]);

  const getTooltipPositionStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      position: 'fixed',
      top: `${tooltipPosition.top}px`,
      zIndex: 9999,
    };

    if (position === 'left') {
      style.left = `${tooltipPosition.left}px`;
    } else if (position === 'right') {
      style.right = `${window.innerWidth - tooltipPosition.left}px`;
    } else {
      style.left = `${tooltipPosition.left}px`;
      style.transform = verticalPosition === 'top' ? 'translate(-50%, -100%)' : 'translateX(-50%)';
    }

    if (verticalPosition === 'top' && position !== 'center') {
      style.transform = 'translateY(-100%)';
    }

    return style;
  };

  const getArrowPositionClasses = () => {
    const horizontal = position === 'left' ? 'left-4' : position === 'right' ? 'right-4' : 'left-1/2 -translate-x-1/2';
    const vertical = verticalPosition === 'top' ? 'top-full -mt-px' : 'bottom-full -mb-px rotate-180';
    return `${horizontal} ${vertical}`;
  };

  const tooltipContent = isHovered && mounted && (
    <div
      style={getTooltipPositionStyle()}
      className="w-64 bg-popover border border-border rounded-lg shadow-lg p-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Arrow */}
      <div className={`absolute ${getArrowPositionClasses()}`}>
        <div className="border-8 border-transparent border-t-border" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full border-[7px] border-transparent border-t-popover" />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-semibold text-foreground truncate">
            {filename}
          </h4>
          {sources.length > 1 && (
            <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0">
              {sources.length} chunks
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground leading-snug">
          {previewText}
        </p>
        <p className="text-[9px] text-primary font-medium">
          Click to view full text
        </p>
      </div>
    </div>
  );

  return (
    <>
      <span
        className="relative inline-block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          ref={buttonRef}
          className="inline-flex items-center justify-center px-2 py-0.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 text-xs font-medium hover:bg-primary/20 transition-colors cursor-pointer mx-0.5 align-middle"
          onClick={onClick}
          aria-label={`Citation: ${filename}`}
          style={{ minWidth: '40px', minHeight: '20px' }}
        >
          {shortFilename}
        </button>
      </span>

      {/* Render tooltip in portal to avoid overflow clipping */}
      {mounted && tooltipContent && createPortal(tooltipContent, document.body)}
    </>
  );
}
