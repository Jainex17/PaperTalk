'use client';

import { useRef } from 'react';
import { Send } from 'lucide-react';
import { useAutoResizeTextarea } from '@/hooks/useAutoResizeTextarea';
import { ModelSelector } from '@/components/ui/ModelSelector';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  loading: boolean;
  placeholder?: string;
  provider?: 'openrouter' | 'gemini';
  model?: string;
  onProviderChange?: (provider: 'openrouter' | 'gemini') => void;
  onModelChange?: (model: string) => void;
}

export function MessageInput({ value, onChange, onSend, loading, placeholder, provider, model, onProviderChange, onModelChange }: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useAutoResizeTextarea(textareaRef, value);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex gap-3 bg-card rounded-2xl p-2 items-end" style={{ boxShadow: 'var(--shadow-lg)' }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Ask anything about your documents..."}
        disabled={loading}
        rows={4}
        className="flex-1 w-full bg-transparent px-4 py-3 outline-none text-sm placeholder:text-muted-foreground resize-none overflow-hidden transition-all duration-300 ease-in-out"
      />
      <div className="flex items-center gap-3 flex-shrink-0">
        {provider && model && onProviderChange && onModelChange && (
          <ModelSelector
            provider={provider}
            model={model}
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        )}
        <button
          onClick={onSend}
          disabled={!value.trim() || loading}
          className="px-3 py-3 bg-primary cursor-pointer text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 flex items-center justify-center"
        >
          {loading ? (
            <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
