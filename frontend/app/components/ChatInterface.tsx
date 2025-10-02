'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, FileText, Loader2, Trash, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Source {
  doc_id: string;
  relevance_score: number | string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Source[];
}

interface Document {
  name: string;
  uploadedAt: Date;
  type: string;
  isUploading?: boolean;
}

interface ChatInterfaceProps {
  spaceid: string;
}

export function ChatInterface({ spaceid }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (ext === 'txt') return 'TXT';
    return 'Document';
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          space_id: spaceid,
          query: input,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain')) {
      // Create document with uploading state
      const newDoc: Document = {
        name: selectedFile.name,
        uploadedAt: new Date(),
        type: getFileType(selectedFile.name),
        isUploading: true
      };

      setDocuments([...documents, newDoc]);

      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('space_id', spaceid);
        formData.append('file', selectedFile);

        // Upload to backend
        const response = await fetch('http://localhost:8000/uploadpdf', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();
        console.log('Upload successful:', result);

        // Update document state to remove uploading status
        setDocuments(prev =>
          prev.map(doc =>
            doc.name === selectedFile.name
              ? { ...doc, isUploading: false }
              : doc
          )
        );
      } catch (error) {
        console.error('Upload error:', error);
        // Remove document from list if upload fails
        setDocuments(prev => prev.filter(doc => doc.name !== selectedFile.name));
        alert('Failed to upload file. Please try again.');
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };


  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Messages */}
      <div className="flex-1 w-full flex justify-center scrollbar-thin">
        {messages.length === 0 ? (
          <div className="w-[60%] px-30 flex flex-col items-center justify-center pb-30">
            <div className='w-full flex justify-between items-center'>
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-semibold font-serif">
                  PaperTalk
                </h1>
              </div>
              <button
                onClick={() => setIsDialogOpen(true)}
                className='border border-border bg-secondary text-secondary-foreground py-2 px-4 rounded-full hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer'
              >
                {documents.length > 0 && (
                  <div className="flex -space-x-2">
                    {Array.from({ length: Math.min(documents.length, 3) }).map((_, i) => {
                      const colors = ['bg-green-500', 'bg-blue-500', 'bg-gray-500'];
                      return (
                        <div key={i} className={`w-6 h-6 ${colors[i]} rounded-md flex items-center justify-center border-2 border-secondary`}>
                          <FileText className="w-3.5 h-3.5 text-white" />
                        </div>
                      );
                    })}
                  </div>
                )}
                <span>{documents.length > 0 ? `${documents.length} file${documents.length > 1 ? 's' : ''}` : 'Add File'}</span>
              </button>
            </div>
            <div className="pt-10 w-full">
                <div className="flex gap-3 bg-muted rounded-2xl p-2" style={{ boxShadow: 'var(--shadow-lg)' }}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask anything about your documents..."
                    disabled={loading}
                    className="flex-1 w-full bg-transparent px-4 py-3 outline-none text-sm placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || loading}
                    className="px-3 py-3 bg-primary cursor-pointer text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
            </div>

          </div>
        ) : (
          <div className="p-8 space-y-6 max-w-3xl mx-auto w-full">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-5 py-4 ${msg.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-card-foreground'
                    }`}
                  style={msg.type === 'assistant' ? { boxShadow: 'var(--shadow-md)' } : undefined}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input box when messages exist */}
      {messages.length > 0 && (
        <div className="border-t border-border bg-background">
          <div className="max-w-3xl mx-auto p-4">
            <div className="flex gap-3 bg-muted rounded-2xl p-2" style={{ boxShadow: 'var(--shadow-lg)' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask a follow-up question..."
                disabled={loading}
                className="flex-1 w-full bg-transparent px-4 py-3 outline-none text-sm placeholder:text-muted-foreground"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || loading}
                className="px-3 py-3 bg-primary cursor-pointer text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDialogOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsDialogOpen(false);
                }
              }}
            >
              <div className="bg-card rounded-2xl p-8 w-full max-w-4xl h-[50vh] flex flex-col" style={{ boxShadow: 'var(--shadow-2xl)' }}>
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-card-foreground">Project files</h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 border border-border flex items-center justify-center bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-all text-md font-medium"
                    >
                      <Plus className="w-4 h-4 inline-block mr-2" />
                      <span>Add files</span>
                    </button>
                    <button
                      onClick={() => setIsDialogOpen(false)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* File limit warning */}
                  {documents.length >= 5 && (
                    <div className="bg-muted rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-foreground mb-1">File limit reached</h3>
                      <p className="text-sm text-muted-foreground">
                        You can add up to 5 files on the free plan. Upgrade to plus to add 25 files.
                      </p>
                    </div>
                  )}

                  {/* Documents List */}
                  {documents.length > 0 ? (
                    <div className="grid gap-2">
                      {documents.map((doc, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-4 p-2 hover:bg-muted/50 border border-border/50 shadow rounded-xl transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {doc.isUploading ? (
                              <Loader2 className="w-6 h-6 text-primary animate-spin" />
                            ) : (
                              <FileText className="w-6 h-6 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.type}
                            </p>
                          </div>
                          {!doc.isUploading && (
                            <button
                              onClick={() => setDocuments(documents.filter((_, i) => i !== index))}
                              className="p-2 hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash className="w-4 h-4 text-destructive" />
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground">No files uploaded yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click "Add files" to upload your documents
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
