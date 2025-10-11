"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const message = searchParams.get('message') || 'Authentication failed';

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg text-center">
        <div className="text-red-600 text-6xl mb-4">✕</div>
        <h1 className="text-3xl font-bold text-gray-900">Authentication Failed</h1>
        <p className="text-gray-600 mt-4">{message}</p>
        <p className="text-sm text-gray-500 mt-6">Redirecting to login page in 5 seconds...</p>
        <button
          onClick={() => router.push('/login')}
          className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
