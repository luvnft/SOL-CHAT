export interface Message {
  id: string;
  sender: string;
  senderUsername?: string;
  recipient: string;
  content: string;
  nonce: string;
  timestamp: number;
  fileUrl?: string;
  fileName?: string;
  status: 'sent' | 'delivered' | 'read';
  confirmationTime?: number;
}

export interface Peer {
  publicKey: string;
  username?: string;
  nickname?: string;
  lastSeen: number;
  messageCount: number;
}

export interface UserProfile {
  publicKey: string;
  username: string;
  updatedAt: number;
  peerNicknames?: Record<string, string>;
}