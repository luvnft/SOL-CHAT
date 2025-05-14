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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="flex flex-col items-center mb-8">
        <img src="/logo.png" alt="SOL-CHAT Logo" className="w-32 h-auto mb-4" />
        <h1 className="text-4xl font-bold text-text mb-2">
          SOL-CHAT
        </h1>
        <p className="text-text-muted">
          Secure messaging on Solana
        </p>
      </div>

      <div className="card p-8 max-w-md w-full shadow-elevation-2 animate-fade-in border-border">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-text">Set Your Username</h2>
          <p className="text-text-muted mt-2">
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
            className="w-full py-3 px-4 rounded-lg font-medium bg-gradient-tertiary text-white hover:opacity-90 transition-opacity"
          >
            Save Username
          </button>
        </form>
      </div>
    </div>
  );
};