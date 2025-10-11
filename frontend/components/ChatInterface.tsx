'use client';

import { useState } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useDocuments } from '@/hooks/useDocuments';
import { MessageInput } from './chat/MessageInput';
import { MessageList } from './chat/MessageList';
import { SuggestedPrompts } from './chat/SuggestedPrompts';
import { SpaceHeader } from './space/SpaceHeader';
import { DocumentsModal } from './documents/DocumentsModal';

interface ChatInterfaceProps {
  spaceid: string;
}

export function ChatInterface({ spaceid }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [hoveredPrompt, setHoveredPrompt] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { messages, loading, sendMessage, clearMessages } = useMessages(spaceid);
  const { documents, loadingDocuments, uploadDocument, deleteDocument } = useDocuments(spaceid);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    if(documents.length === 0) {
      alert("Please upload a document before sending a message.");
      return;
    }

    const messageToSend = input;
    setInput('');
    await sendMessage(messageToSend);
  };

  const handleHoverPrompt = (prompt: string) => {
    setHoveredPrompt(prompt);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <div className="flex-1 w-full flex justify-center overflow-hidden">
        {messages.length === 0 ? (
          <div className="w-[80%] xl:w-[60%] px-30 flex flex-col items-center justify-center">
            <div className='w-full flex justify-between items-center mb-6'>
              <SpaceHeader
                documentsCount={documents.length}
                onOpenDocuments={() => setIsDialogOpen(true)}
              />
            </div>
            <div className="w-full space-y-8">
              <MessageInput
                value={input}
                onChange={setInput}
                onSend={handleSendMessage}
                loading={loading}
                placeholder={hoveredPrompt ? hoveredPrompt : "Ask a question about your documents..."}
              />
              <SuggestedPrompts onSelectPrompt={setInput} onHoverPrompt={handleHoverPrompt} />
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className='px-10 pt-6 flex justify-between items-center'>
              <SpaceHeader
                documentsCount={documents.length}
                onOpenDocuments={() => setIsDialogOpen(true)}
                onClearChat={clearMessages}
                showClearChat={true}
              />
            </div>
            <MessageList messages={messages} loading={loading} />
          </div>
        )}
      </div>

      {messages.length > 0 && (
        <div className="mb-2 absolute bottom-0 left-0 right-0 z-20">
          <div className="max-w-3xl mx-auto p-4">
            <MessageInput
              value={input}
              onChange={setInput}
              onSend={handleSendMessage}
              loading={loading}
              placeholder={hoveredPrompt ? hoveredPrompt : "Ask a question about your documents..."}
            />
          </div>
        </div>
      )}

      <div className='w-full h-40 z-0 fixed bottom-0 bg-gradient-to-t from-background/90 via-background/40 via-30% to-transparent shadow-[0_-8px_32px_rgba(0,0,0,0.12)]' style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', maskImage: 'linear-gradient(to top, black 20%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 100%)' }} />

      <DocumentsModal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        documents={documents}
        loadingDocuments={loadingDocuments}
        onFileUpload={uploadDocument}
        onDeleteDocument={async (documentId: string) => {
          await deleteDocument(documentId);
        }}
      />
    </div>
  );
}
