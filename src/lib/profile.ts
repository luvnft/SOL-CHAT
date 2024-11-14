import type { UserProfile } from '../types/message';

const PROFILE_KEY = 'user_profile';

export async function saveProfile(profile: UserProfile): Promise<void> {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
}

export async function getLocalProfile(): Promise<UserProfile | null> {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export async function fetchProfile(publicKey: string): Promise<UserProfile | null> {
  try {
    // For now, we only support local profiles
    const stored = localStorage.getItem(PROFILE_KEY);
    const profile = stored ? JSON.parse(stored) : null;
    return profile?.publicKey === publicKey ? profile : null;
  } catch {
    return null;
  }
}