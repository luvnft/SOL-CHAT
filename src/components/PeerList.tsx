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
      <div className="p-4 text-center text-gray-500">
        <Clock className="w-6 h-6 animate-spin mx-auto mb-2" />
        <p>Loading peers...</p>
      </div>
    );
  }

  if (peers.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Users className="w-8 h-8 mx-auto mb-2" />
        <p>No recent peers</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {peers.map((peer) => (
        <button
          key={peer.publicKey}
          onClick={() => onSelectPeer(peer.publicKey)}
          className="w-full p-3 hover:bg-gray-50 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Users className="w-6 h-6 text-gray-600" />
              {peer.active !== undefined && (
                <div className="absolute -bottom-1 -right-1">
                  {peer.active ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              )}
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">
                {peer.publicKey.slice(0, 4)}...{peer.publicKey.slice(-4)}
              </p>
              <p className="text-sm text-gray-500">
                Last seen: {new Date(peer.lastSeen).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">{peer.messageCount}</span>
          </div>
        </button>
      ))}
    </div>
  );
};