'use client';

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

const prompts = [
  'Summarize all documents',
  'What are the key findings?',
  'Create bullet points from all documents',
  'List the main conclusions',
];

export function SuggestedPrompts({ onSelectPrompt }: SuggestedPromptsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {prompts.map((prompt, index) => (
        <button
          key={index}
          onClick={() => onSelectPrompt(prompt)}
          className="text-left px-4 py-3 bg-muted/50 hover:bg-accent hover:border-primary/20 border border-transparent rounded-xl transition-all duration-200 text-sm text-foreground hover:-translate-y-0.5"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
