'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, FileText, Loader2, Trash, Plus, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpace } from '@/context/SpaceContext';

interface Source {
  doc_id: string;
  relevance_score: number | string;
  chunk_text: string;
  filename: string;
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

  const { currentSpace, setCurrentSpace } = useSpace();

  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef2 = useRef<HTMLTextAreaElement>(null);

  const [editSpaceName, setEditSpaceName] = useState(false);
  const [tempSpaceName, setTempSpaceName] = useState('');

  useEffect(() => {
    if (currentSpace) {
      setTempSpaceName(currentSpace.name);
    }
  }, [currentSpace]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const adjustHeight = (textarea: HTMLTextAreaElement | null) => {
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
      }
    };
    adjustHeight(textareaRef.current);
    adjustHeight(textareaRef2.current);
  }, [input]);

  const getDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const response = await fetch(`http://localhost:8000/getdocuments/${spaceid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      const docs: Document[] = data.documents.map((doc: any) => ({
        name: doc,
        isUploading: false
      }));
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    getDocuments();
  }, [spaceid]);

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
      const newDoc: Document = {
        name: selectedFile.name,
        uploadedAt: new Date(),
        type: getFileType(selectedFile.name),
        isUploading: true
      };

      setDocuments([...documents, newDoc]);

      try {
        const formData = new FormData();
        formData.append('space_id', spaceid);
        formData.append('file', selectedFile);

        const response = await fetch('http://localhost:8000/uploadpdf', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();
        console.log('Upload successful:', result);

        setDocuments(prev =>
          prev.map(doc =>
            doc.name === selectedFile.name
              ? { ...doc, isUploading: false }
              : doc
          )
        );
      } catch (error) {
        console.error('Upload error:', error);
        setDocuments(prev => prev.filter(doc => doc.name !== selectedFile.name));
        alert('Failed to upload file. Please try again.');
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSpaceNameSave = async () => {
    if (tempSpaceName.trim() === '' || !currentSpace) {
      return;
    }
    console.log('Saving space name:', tempSpaceName, "ID:", currentSpace.id);
    try {
      const response = await fetch(`http://localhost:8000/spaces/${currentSpace.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_name: tempSpaceName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update space name');
      }

      await response.json();
      setCurrentSpace(
        { ...currentSpace, name: tempSpaceName }
      );
      setEditSpaceName(false);
    } catch (error) {
      console.error('Error saving space name:', error);
    }
  };

  const handleSpaceNameCancel = () => {
    setTempSpaceName(currentSpace?.name || 'New Space');
    setEditSpaceName(false);
  };

  const renderMessageWithCitations = (content: string, sources?: Source[]) => {
    if (!sources || sources.length === 0) {
      return <p className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{content}</p>;
    }

    const citationMap = new Map<string, number>();
    sources.forEach((source, index) => {
      citationMap.set(source.doc_id, index + 1);
    });

    const parts = content.split(/(\(doc_[^)]+\))/g);

    return (
      <p className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
        {parts.map((part, index) => {
          const match = part.match(/\(doc_([^)]+)\)/);
          if (match) {
            const docId = `doc_${match[1]}`;
            const citationNumber = citationMap.get(docId);
            const source = sources.find(s => s.doc_id === docId);

            if (citationNumber && source) {
              return (
                <span key={index} className="group relative inline-block">
                  <sup className="text-primary cursor-help font-medium">[{citationNumber}]</sup>
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
    <div className="h-screen flex flex-col bg-background text-foreground">
      <div className="flex-1 w-full flex justify-center overflow-hidden">
        {messages.length === 0 ? (
          <div className="w-[80%] xl:w-[60%] px-30 flex flex-col items-center justify-center">
            <div className='w-full flex justify-between items-center mb-6'>
              <div className="flex items-center gap-3">
                <a href="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </a>
                <div className="text-center">
                  {editSpaceName ? (<>
                    <input
                      type="text"
                      value={tempSpaceName}
                      onChange={(e) => setTempSpaceName(e.target.value)}
                      onBlur={handleSpaceNameSave}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSpaceNameSave();
                        } else if (e.key === 'Escape') {
                          handleSpaceNameCancel();
                        }
                      }}
                      autoFocus
                      className="text-xl font-semibold font-serif outline-none border-b border-primary bg-transparent"
                    />
                  </>) :
                    (<h1 className="text-xl font-semibold font-serif" onClick={() => setEditSpaceName(true)}>
                      {currentSpace ? currentSpace.name : 'New Space'}
                    </h1>
                    )}
                </div>
              </div>
              <button
                onClick={() => setIsDialogOpen(true)}
                className='border border-border bg-secondary text-secondary-foreground py-2 px-5 rounded-xl hover:opacity-90 transition-all gap-2 cursor-pointer'
              >
                <span>{documents.length > 0 ? `${documents.length} file${documents.length > 1 ? 's' : ''}` : 'Add File'}</span>
              </button>
            </div>
            <div className="w-full space-y-8">
              <div className="flex gap-3 bg-card rounded-2xl p-2 items-end" style={{ boxShadow: 'var(--shadow-lg)' }}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask anything about your documents..."
                  disabled={loading}
                  rows={3}
                  className="flex-1 w-full bg-transparent px-4 py-3 outline-none text-sm placeholder:text-muted-foreground resize-none overflow-hidden"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || loading}
                  className="px-3 py-3 bg-primary cursor-pointer text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 flex items-center justify-center"
                >
                  {loading ? (
                    <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setInput('Summarize all documents')}
                  className="text-left px-4 py-3 bg-muted/50 hover:bg-accent hover:border-primary/20 border border-transparent rounded-xl transition-all duration-200 text-sm text-foreground hover:-translate-y-0.5"
                >
                  Summarize all documents
                </button>
                <button
                  onClick={() => setInput('What are the key findings?')}
                  className="text-left px-4 py-3 bg-muted/50 hover:bg-accent hover:border-primary/20 border border-transparent rounded-xl transition-all duration-200 text-sm text-foreground hover:-translate-y-0.5"
                >
                  What are the key findings?
                </button>
                <button
                  onClick={() => setInput('Compare the main topics discussed')}
                  className="text-left px-4 py-3 bg-muted/50 hover:bg-accent hover:border-primary/20 border border-transparent rounded-xl transition-all duration-200 text-sm text-foreground hover:-translate-y-0.5"
                >
                  Compare the main topics discussed
                </button>
                <button
                  onClick={() => setInput('List the main conclusions')}
                  className="text-left px-4 py-3 bg-muted/50 hover:bg-accent hover:border-primary/20 border border-transparent rounded-xl transition-all duration-200 text-sm text-foreground hover:-translate-y-0.5"
                >
                  List the main conclusions
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="w-full">
            <div className='px-10 pt-6 flex justify-between items-center'>
              <div className="flex items-center gap-3">
                <a href="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </a>
                <div className="text-center space-y-4">
                  <h1 className="text-xl font-semibold font-serif">
                    {currentSpace ? currentSpace.name : 'New Space'}
                  </h1>
                </div>
              </div>
              <button
                onClick={() => setIsDialogOpen(true)}
                className='border border-border bg-secondary text-secondary-foreground py-2 px-5 rounded-xl hover:opacity-90 transition-all cursor-pointer'
              >
                <span>{documents.length > 0 ? `${documents.length} file${documents.length > 1 ? 's' : ''}` : 'Add File'}</span>
              </button>
            </div>

            <div className="p-8 pb-52 space-y-6 max-w-3xl mx-auto w-full flex flex-col overflow-y-auto h-[95vh] scrollbar-hidden">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[89%] rounded-xl ${msg.type === 'user'
                      ? 'bg-primary text-primary-foreground py-2 px-5'
                      : 'py-2'
                      }`}
                  >
                    {msg.type === 'user' ? (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{msg.content}</p>
                    ) : (
                      renderMessageWithCitations(msg.content, msg.sources)
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <svg className="w-16 h-9" viewBox="0 0 60 16">
                    <circle fill="currentColor" cx="6" cy="8" r="4">
                      <animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.1" />
                    </circle>
                    <circle fill="currentColor" cx="26" cy="8" r="4">
                      <animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.2" />
                    </circle>
                    <circle fill="currentColor" cx="46" cy="8" r="4">
                      <animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.3" />
                    </circle>
                  </svg>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>
      {messages.length > 0 && (
        <div className="mb-2 absolute bottom-0 left-0 right-0 z-20">
          <div className="max-w-3xl mx-auto p-4">
            <div className="flex gap-3 bg-card rounded-2xl p-2 items-end" style={{ boxShadow: 'var(--shadow-lg)' }}>
              <textarea
                ref={textareaRef2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask a follow-up question..."
                disabled={loading}
                rows={3}
                className="flex-1 w-full bg-transparent px-4 py-3 outline-none text-sm placeholder:text-muted-foreground resize-none overflow-hidden"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || loading}
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
        </div>
      )}
      <div className='w-full h-40 z-0 fixed bottom-0 bg-gradient-to-t from-background/90 via-background/40 via-30% to-transparent shadow-[0_-8px_32px_rgba(0,0,0,0.12)]' style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', maskImage: 'linear-gradient(to top, black 20%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 100%)' }} />

      <AnimatePresence>
        {isDialogOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDialogOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-card-foreground">Project files</h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 border border-border flex items-center cursor-pointer justify-center bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-all text-md font-medium"
                    >
                      <span>Add files</span>
                    </button>
                    <button
                      onClick={() => setIsDialogOpen(false)}
                      className="px-2 py-2 border border-border flex items-center cursor-pointer justify-center bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-all text-md font-medium"
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

                  {documents.length >= 5 && (
                    <div className="bg-muted rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-foreground mb-1">File limit reached</h3>
                      <p className="text-sm text-muted-foreground">
                        You can add up to 5 files on the free plan. Upgrade to plus to add 25 files.
                      </p>
                    </div>
                  )}

                  {loadingDocuments ? (
                    <div className="grid gap-2">
                      {[...Array(3)].map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-2 border border-border/50 rounded-xl animate-pulse"
                        >
                          <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0" />
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : documents.length > 0 ? (
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
