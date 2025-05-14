import React, { useState, useEffect } from 'react';
import { Users, Clock, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { getRecentPeers, getAddressActivity } from '../lib/peers';
import type { Peer } from '../types/message';

interface Props {
  onSelectPeer: (publicKey: string) => void;
}

export const PeerList: React.FC<Props> = ({ onSelectPeer }) => {
  const { connection } = useConnection();
  const [peers, setPeers] = useState<(Peer & { active?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPeers = async () => {
      const recentPeers = await getRecentPeers();

      // Check activity status for each peer
      const peersWithActivity = await Promise.all(
        recentPeers.map(async (peer) => {
          const { active } = await getAddressActivity(connection, peer.publicKey);
          return { ...peer, active };
        })
      );

      setPeers(peersWithActivity);
      setLoading(false);
    };

    loadPeers();
  }, [connection]);

  if (loading) {
    return (
      <div className="p-8 text-center text-text-muted flex flex-col items-center">
        <div className="bg-gradient-secondary p-2 rounded-lg mb-4">
          <Clock className="w-6 h-6 animate-spin text-white" />
        </div>
        <p>Loading peers...</p>
      </div>
    );
  }

  if (peers.length === 0) {
    return (
      <div className="p-8 text-center text-text-muted flex flex-col items-center">
        <div className="bg-gradient-secondary p-2 rounded-lg mb-4 opacity-50">
          <Users className="w-8 h-8 text-white" />
        </div>
        <p className="mb-2">No recent peers</p>
        <p className="text-sm">Start a conversation to add peers to this list.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {peers.map((peer) => (
        <button
          key={peer.publicKey}
          onClick={() => onSelectPeer(peer.publicKey)}
          className="w-full p-3 hover:bg-card-highlight transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-gradient-secondary p-1.5 rounded-lg">
                <Users className="w-4 h-4 text-white" />
              </div>
              {peer.active !== undefined && (
                <div className="absolute -bottom-1 -right-1">
                  {peer.active ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-text-muted" />
                  )}
                </div>
              )}
            </div>
            <div className="text-left">
              <p className="font-medium text-text">
                {peer.nickname || peer.username || `${peer.publicKey.slice(0, 4)}...${peer.publicKey.slice(-4)}`}
              </p>
              <p className="text-sm text-text-muted">
                Last seen: {new Date(peer.lastSeen).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-text-muted bg-card-highlight px-2 py-1 rounded-lg">
            <MessageSquare className="w-3 h-3" />
            <span className="text-xs">{peer.messageCount}</span>
          </div>
        </button>
      ))}
    </div>
  );
};