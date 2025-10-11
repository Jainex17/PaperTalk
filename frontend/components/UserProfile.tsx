"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export function UserProfile() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
      >
        <div className="text-left hidden md:block">
          <p className="text-lg px-7 cursor-pointer font-medium text-sidebar-foreground">{user.name}</p>
        </div>
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg py-1 z-20">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-medium text-card-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
