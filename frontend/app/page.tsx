"use client";

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import ss from '@/assets/ss.png';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowRight,
  BookOpenText,
  FileSearch,
  FolderKanban,
  MessageSquareQuote,
  SearchCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const workflowSteps = [
  {
    title: 'Create a space',
    description: 'Start a workspace for a case file, earnings review, research packet, or any document set you want to keep together.',
  },
  {
    title: 'Upload real source material',
    description: 'Add PDFs, text files, Markdown notes, or paste raw text directly into PaperTalk when a file does not exist yet.',
  },
  {
    title: 'Ask direct questions',
    description: 'Request summaries, compare findings across documents, or drill into a clause, figure, or section without reading end to end.',
  },
];

const features = [
  {
    icon: FileSearch,
    title: 'Source-backed answers',
    description: 'Responses can include the exact document chunks used to answer the question, so you can verify what the model relied on.',
  },
  {
    icon: FolderKanban,
    title: 'Document spaces',
    description: 'Keep separate collections for different clients, projects, or research themes instead of mixing every file into one thread.',
  },
  {
    icon: Sparkles,
    title: 'Summaries on demand',
    description: 'Generate concise summaries, bullet points, key findings, and conclusions directly from the uploaded material.',
  },
  {
    icon: SearchCheck,
    title: 'Cross-document retrieval',
    description: 'PaperTalk can pull evidence from multiple documents when a question spans more than one file or compares related sources.',
  },
  {
    icon: MessageSquareQuote,
    title: 'Follow-up friendly chat',
    description: 'Conversation history is used to keep context, making it easier to refine a question instead of restating everything each time.',
  },
  {
    icon: BookOpenText,
    title: 'Fits everyday document work',
    description: 'Useful for contracts, reports, briefs, notes, policies, guides, and any other text-heavy material that needs faster review.',
  },
];

const faqs = [
  {
    question: 'What file types can I upload today?',
    answer: 'PaperTalk currently supports PDF, TXT, and Markdown files. You can also paste raw text directly and save it into a space as a text document.',
  },
  {
    question: 'Can it answer questions across multiple documents?',
    answer: 'Yes. The retrieval flow is built to handle cross-document questions, combine evidence from more than one source, and synthesize an answer from the relevant files.',
  },
  {
    question: 'Does it show where an answer came from?',
    answer: 'Yes. The chat interface supports source citations so you can inspect the document chunks used for a response instead of trusting a summary blindly.',
  },
  {
    question: 'How should I organize my work?',
    answer: 'Use spaces to group documents by matter, account, research theme, or project. That keeps retrieval focused and makes each chat more relevant.',
  },
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="px-6 pt-20 pb-16">
        <section className="max-w-6xl mx-auto text-center mb-20 mt-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent/70 px-4 py-2 text-sm text-accent-foreground mb-6">
            <ShieldCheck className="w-4 h-4" />
            Read faster without losing the source trail
          </div>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-6">
            Talk with your documents
          </h1>

          <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-4xl mx-auto">
            PaperTalk turns dense source material into a working conversation. Upload reports, contracts, notes, or research files, then ask for summaries, comparisons, findings, and cited answers in plain language.
          </p>

          {!loading && (
            <div className="mb-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/spaces"
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                {isAuthenticated ? 'Go to Spaces' : 'Get Started'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-8 py-3 border border-border rounded-lg hover:border-primary/40 hover:bg-muted/60 transition-colors text-sm font-medium"
              >
                Explore Features
              </a>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-5xl mx-auto mb-14">
            <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm">
              <p className="text-sm text-muted-foreground mb-2">Best for</p>
              <p className="text-lg font-medium">Reports, contracts, research packets, policy docs, and working notes.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm">
              <p className="text-sm text-muted-foreground mb-2">Input formats</p>
              <p className="text-lg font-medium">PDF, TXT, Markdown, or pasted text saved directly into a space.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm">
              <p className="text-sm text-muted-foreground mb-2">Output style</p>
              <p className="text-lg font-medium">Summaries, conclusions, evidence-backed answers, and follow-up chat.</p>
            </div>
          </div>

          <div className="w-full max-w-6xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl bg-card">
              <Image
                src={ss}
                alt="PaperTalk Interface"
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="max-w-6xl mx-auto mb-20">
          <div className="max-w-2xl mb-10">
            <p className="text-sm uppercase tracking-[0.24em] text-primary mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">A simple workflow for heavy reading</h2>
            <p className="text-lg text-muted-foreground">
              The product stays lightweight: organize a space, load source material, and ask focused questions when you need answers instead of browsing manually.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {workflowSteps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold mb-5">
                  0{index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="max-w-6xl mx-auto mb-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.24em] text-primary mb-3">Features</p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Built for real document review</h2>
              <p className="text-lg text-muted-foreground">
                These are the core behaviors already reflected in the product, not generic roadmap promises.
              </p>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-accent/50 px-5 py-4 text-sm text-accent-foreground max-w-md">
              Better questions become faster when you can keep the original source material within reach.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/30 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-accent text-accent-foreground flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="max-w-4xl mx-auto mb-20">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-[0.24em] text-primary mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Questions teams ask before they start</h2>
            <p className="text-lg text-muted-foreground">
              The answers below reflect the current product behavior in this codebase.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-border bg-card p-6 shadow-sm open:border-primary/30"
              >
                <summary className="list-none cursor-pointer flex items-center justify-between gap-4">
                  <span className="text-lg font-semibold">{item.question}</span>
                  <span className="text-primary text-2xl leading-none transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto">
          <div className="rounded-3xl border border-border bg-card px-8 py-10 md:px-12 md:py-14 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <div className="max-w-2xl">
                <p className="text-sm uppercase tracking-[0.24em] text-primary mb-3">Start Reading Smarter</p>
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Bring the document pile into one place and ask better questions.</h2>
                <p className="text-lg text-muted-foreground">
                  Use PaperTalk when search is too shallow and full manual review is too slow.
                </p>
              </div>
              {!loading && (
                <Link
                  href="/spaces"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  {isAuthenticated ? 'Open Your Spaces' : 'Create Your First Space'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/80 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <p className="text-lg font-semibold mb-2">PaperTalk</p>
            <p className="text-sm text-muted-foreground max-w-md">
              AI-assisted document reading for spaces, summaries, citations, and cross-document questions.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            <Link href={isAuthenticated ? "/spaces" : "/login"} className="text-muted-foreground hover:text-foreground transition-colors">
              {isAuthenticated ? 'Spaces' : 'Sign In'}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
