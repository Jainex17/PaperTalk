import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-primary-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <span className="text-xl font-semibold text-foreground">PaperTalk</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm">
        <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
          How It Works
        </Link>
        <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
          Features
        </Link>
        <Link href="#community" className="text-muted-foreground hover:text-foreground transition-colors">
          Community
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="px-6 py-2 text-sm text-foreground hover:text-muted-foreground transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/spaces"
          className="px-6 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Start For Free
        </Link>
      </div>
    </nav>
  );
}
