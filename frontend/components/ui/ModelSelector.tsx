'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, Zap } from 'lucide-react';

const MODELS = [
  {
    provider: 'openrouter' as const,
    label: 'OpenRouter',
    icon: Zap,
    models: [
      { value: 'openai/gpt-oss-20b:free', label: 'GPT OSS 20B' },
      { value: 'openai/gpt-oss-120b:free', label: 'GPT OSS 120B' },
      { value: 'google/gemma-4-31b-it:free', label: 'Gemma 4 31B' },
      { value: 'z-ai/glm-4.5-air:free', label: 'GLM 4.5 Air' },
      { value: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B' },
      { value: 'qwen/qwen3-coder:free', label: 'Qwen 3 Coder' },
      { value: 'nvidia/nemotron-3-super-120b-a12b:free', label: 'Nemotron 3 Super' },
    ],
  },
  {
    provider: 'gemini' as const,
    label: 'Gemini',
    icon: Sparkles,
    models: [
      { value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
      { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite' },
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
      { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
    ],
  },
];

interface ModelSelectorProps {
  provider: 'openrouter' | 'gemini';
  model: string;
  onProviderChange: (provider: 'openrouter' | 'gemini') => void;
  onModelChange: (model: string) => void;
}

export function ModelSelector({ provider, model, onProviderChange, onModelChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [hoveredProvider, setHoveredProvider] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setHoveredProvider(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentGroup = MODELS.find((g) => g.provider === provider);
  const currentModel = currentGroup?.models.find((m) => m.value === model);
  const CurrentIcon = currentGroup?.icon ?? Zap;

  const handleSelectModel = (selectedProvider: 'openrouter' | 'gemini', selectedModel: string) => {
    onProviderChange(selectedProvider);
    onModelChange(selectedModel);
    setOpen(false);
    setHoveredProvider(null);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-medium bg-muted/50 border border-border/50 hover:bg-muted transition-all duration-200 whitespace-nowrap"
      >
        <CurrentIcon className="w-3 h-3 shrink-0" />
        <span className="max-w-28 truncate">{currentModel?.label ?? model}</span>
        <ChevronDown className="w-3 h-3 shrink-0 opacity-50" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] bg-card border border-border rounded-lg shadow-xl py-1">
          {MODELS.map((group) => (
            <div
              key={group.provider}
              className="relative"
              onMouseEnter={() => setHoveredProvider(group.provider)}
              onMouseLeave={() => setHoveredProvider(null)}
            >
              <div className="flex items-center justify-between px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <group.icon className="w-3 h-3" />
                  {group.label}
                </span>
                <ChevronDown className="w-3 h-3 -rotate-90 opacity-50" />
              </div>
              {hoveredProvider === group.provider && (
                <div className="absolute left-full top-0 ml-1 min-w-[180px] bg-card border border-border rounded-lg shadow-xl py-1">
                  {group.models.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => handleSelectModel(group.provider, m.value)}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                        provider === group.provider && model === m.value
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
