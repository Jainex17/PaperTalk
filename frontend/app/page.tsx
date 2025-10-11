import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h1 className="text-6xl font-semibold tracking-tight mb-6">
          Chat with your documents
        </h1>
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          Upload PDFs, ask questions, and get instant answers powered by AI.
          Your intelligent document assistant.
        </p>
        <div>
          <Link
            href="/spaces"
            className="px-16 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
