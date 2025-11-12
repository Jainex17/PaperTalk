"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/logo.png';
import Image from 'next/image';

export default function Navbar() {
  const { user, isAuthenticated, loading } = useAuth();

  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
          <Image src={logo} alt="PaperTalk" width={68} height={68} className="object-contain w-full h-full" />
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
        <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
          Pricing
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {!loading && (
          isAuthenticated && user ? (
            <span className="text-sm text-foreground">
              {user.name}
            </span>
          ) : (
            <Link
              href="/login"
              className="px-6 py-2 text-sm text-foreground hover:text-muted-foreground transition-colors"
            >
              Sign In
            </Link>
          )
        )}
      </div>
    </nav>
  );
}
