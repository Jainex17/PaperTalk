"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (processed) return;

    const token = searchParams.get('token');
    const errorMessage = searchParams.get('message');

    if (errorMessage) {
      setError(errorMessage);
      setProcessed(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      return;
    }

    if (token) {
      setProcessed(true);
      login(token).then(() => {
        router.push('/');
      }).catch((err) => {
        console.error('Login failed:', err);
        setError('Authentication failed. Please try again.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      });
    } else if (!processed) {
      setError('No token received');
      setProcessed(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  }, [searchParams, login, router, processed]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">✕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authenticating...</h2>
        <p className="text-gray-600">Please wait while we sign you in</p>
      </div>
    </div>
  );
}
