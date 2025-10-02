'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Document {
  name: string;
  uploadedAt: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  return (
    <div className="h-screen flex bg-black text-white">
      {/* Left Sidebar - Documents List */}
      <div className="w-64 border-r border-zinc-800 flex flex-col">
        {/* Sidebar Header */}
        <div className="border-b border-zinc-800 p-4 flex items-center gap-3">
        </div>

        {/* Upload Section */}
        <div className="p-4 border-b border-zinc-800">
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="file-upload"
          />
          {!file ? (
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm border border-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-900 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload Document
            </label>
          ) : (
            <button
              disabled={loading}
              className="w-full px-3 py-2 text-sm bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-50 transition"
            >
              {loading ? 'Uploading...' : `Upload ${file.name.slice(0, 12)}...`}
            </button>
          )}
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto p-2">
          {documents.length === 0 ? (
            <div className="text-center text-sm text-zinc-600 py-8 px-4">
              No documents uploaded yet
            </div>
          ) : (
            <div className="space-y-1">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-900 transition group cursor-pointer"
                >
                  {/* Document Icon */}
                  <div className="mt-0.5 flex-shrink-0">
                    {doc.name.endsWith('.pdf') ? (
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8 18v-1h8v1H8zm0-4v-1h8v1H8zm0-4V9h4v1H8z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-zinc-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zm-2 14v-1h6v1h-6zm0-4v-1h6v1h-6z" />
                      </svg>
                    )}
                  </div>

                  {/* Document Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-light">Chat</h1>
            <button className="p-2 hover:bg-zinc-900 rounded transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-zinc-600">
              <div className="text-center space-y-2">
                <p>Upload a document and start asking questions</p>
                <p className="text-sm text-zinc-700">Supports PDF and TXT files</p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-3 ${
                      msg.type === 'user'
                        ? 'bg-white text-black'
                        : 'bg-zinc-950 border border-zinc-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-zinc-800 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={loading}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 outline-none focus:border-zinc-700 transition text-sm"
            />
            <button
              disabled={!input.trim() || loading}
              className="px-6 bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
