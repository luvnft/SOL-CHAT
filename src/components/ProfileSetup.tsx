import React, { useState, useEffect } from 'react';
import { UserCircle } from 'lucide-react';
import { saveProfile, getLocalProfile } from '../lib/profile';
import type { UserProfile } from '../types/message';

interface Props {
  publicKey: string;
  onComplete: () => void;
}

export const ProfileSetup: React.FC<Props> = ({ publicKey, onComplete }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getLocalProfile();
      if (profile?.username) {
        setUsername(profile.username);
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    try {
      const profile: UserProfile = {
        publicKey,
        username: username.trim(),
        updatedAt: Date.now(),
      };

      await saveProfile(profile);
      onComplete();
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-b-2 rounded-full animate-spin border-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="flex flex-col items-center mb-8">
        <img src="/logo.png" alt="SOL-CHAT Logo" className="w-32 h-auto mb-4" />
        <h1 className="mb-2 text-4xl font-bold text-text">
          🌊 WATAA.MENU
        </h1>
        <p className="text-text-muted">
          Secure messaging on Solana Powered By $WATAA Tips
        </p>
      </div>

      <div className="w-full max-w-md p-8 card shadow-elevation-2 animate-fade-in border-border">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-text">Set Your Username</h2>
          <p className="mt-2 text-text-muted">
            Choose a username that other users will see when you message them.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`input mt-1 bg-card-highlight border-border ${
                error ? 'border-error focus:ring-error/50' : ''
              }`}
              placeholder="Enter your username"
            />
            {error && <p className="mt-1 text-sm text-error">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 font-medium text-white transition-opacity rounded-lg bg-gradient-tertiary hover:opacity-90"
          >
            Save Username
          </button>
        </form>
      </div>
    </div>
  );
};