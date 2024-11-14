import { Connection, PublicKey } from '@solana/web3.js';
import { getLocalProfile, saveProfile } from './profile';
import type { Peer } from '../types/message';

const RECENT_PEERS_KEY = 'recent_peers';
const MAX_RECENT_PEERS = 50;

export async function validateSolanaAddress(address: string): Promise<boolean> {
  try {
    if (!address || typeof address !== 'string') return false;
    address = address.trim();
    
    if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) return false;
    if (address.length < 32 || address.length > 44) return false;
    
    const pubKey = new PublicKey(address);
    return PublicKey.isOnCurve(pubKey.toBytes());
  } catch {
    return false;
  }
}

export async function getRecentPeers(): Promise<Peer[]> {
  try {
    const stored = localStorage.getItem(RECENT_PEERS_KEY);
    const peers = stored ? JSON.parse(stored) : [];
    
    const profile = await getLocalProfile();
    if (profile?.peerNicknames) {
      return peers.map((peer: Peer) => ({
        ...peer,
        nickname: profile.peerNicknames[peer.publicKey]
      })).sort((a: Peer, b: Peer) => b.lastSeen - a.lastSeen);
    }
    
    return peers.sort((a: Peer, b: Peer) => b.lastSeen - a.lastSeen);
  } catch (error) {
    console.error('Error getting recent peers:', error);
    return [];
  }
}

export async function addRecentPeer(publicKey: string): Promise<void> {
  try {
    const peers = await getRecentPeers();
    const now = Date.now();

    // Find existing peer
    const existingPeerIndex = peers.findIndex(p => p.publicKey === publicKey);
    const existingPeer = existingPeerIndex !== -1 ? peers[existingPeerIndex] : null;

    // Create updated peer object
    const updatedPeer: Peer = {
      publicKey,
      lastSeen: now,
      messageCount: (existingPeer?.messageCount || 0) + 1
    };

    // Remove existing peer if present
    if (existingPeerIndex !== -1) {
      peers.splice(existingPeerIndex, 1);
    }

    // Add peer to the beginning of the array
    peers.unshift(updatedPeer);

    // Keep only recent peers
    const recentPeers = peers.slice(0, MAX_RECENT_PEERS);

    localStorage.setItem(RECENT_PEERS_KEY, JSON.stringify(recentPeers));
  } catch (error) {
    console.error('Error adding recent peer:', error);
  }
}

export async function setPeerNickname(publicKey: string, nickname: string): Promise<void> {
  try {
    const profile = await getLocalProfile();
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      peerNicknames: {
        ...(profile.peerNicknames || {}),
        [publicKey]: nickname
      }
    };

    await saveProfile(updatedProfile);
  } catch (error) {
    console.error('Error setting peer nickname:', error);
  }
}

export async function getAddressActivity(
  connection: Connection,
  address: string
): Promise<{ active: boolean; lastActive?: number }> {
  try {
    const pubKey = new PublicKey(address);
    const signatures = await connection.getSignaturesForAddress(pubKey, { limit: 1 });
    
    return {
      active: signatures.length > 0,
      lastActive: signatures[0]?.blockTime ? signatures[0].blockTime * 1000 : undefined
    };
  } catch (error) {
    console.error('Error checking address activity:', error);
    return { active: false };
  }
}