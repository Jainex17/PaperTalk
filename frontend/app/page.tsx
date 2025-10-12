import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import ss from '@/assets/ss.png';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex flex-col items-center justify-center px-6 pt-20 pb-16">
        <div className="max-w-3xl mx-auto text-center mb-16 mt-16">
          <h1 className="text-6xl font-semibold tracking-tight mb-6">
            Talk with your documents
          </h1>

          <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-6xl mx-auto">
            From legal agreements to financial reports, PDF.ai brings your documents to life. You can ask questions, get summaries, find information, and more.
          </p>

          <div className="mb-16">
            <Link
              href="/spaces"
              className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Start For Free
            </Link>
          </div>
        </div>

        {/* Screenshot Preview Section */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="relative rounded-xl overflow-hidden border border-border shadow-2xl">
            <Image
              src={ss}
              alt="PaperTalk Interface"
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
