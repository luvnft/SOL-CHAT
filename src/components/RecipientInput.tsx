import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Edit2, Check } from 'lucide-react';
import { validateSolanaAddress, setPeerNickname } from '../lib/peers';
import { fetchProfile } from '../lib/profile';
import type { Peer } from '../types/message';

interface Props {
  onRecipientSelect: (address: string) => void;
  recentPeers: Peer[];
}

export const RecipientInput: React.FC<Props> = ({ onRecipientSelect, recentPeers }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredPeers, setFilteredPeers] = useState<Peer[]>([]);
  const [selectedPeerUsername, setSelectedPeerUsername] = useState<string | null>(null);
  const [editingNickname, setEditingNickname] = useState<string | null>(null);
  const [nicknameInput, setNicknameInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const validationTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const filterPeers = () => {
      if (!input) {
        setFilteredPeers(recentPeers);
        return;
      }

      const filtered = recentPeers.filter(
        (peer) =>
          peer.publicKey.toLowerCase().includes(input.toLowerCase()) ||
          peer.username?.toLowerCase().includes(input.toLowerCase()) ||
          peer.nickname?.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredPeers(filtered);
    };

    filterPeers();
  }, [input, recentPeers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateAndSelectAddress = async (address: string) => {
    setIsValidating(true);
    try {
      const isValid = await validateSolanaAddress(address);
      if (isValid) {
        setError('');
        onRecipientSelect(address);
        return true;
      } else {
        setError('Invalid Solana address');
        onRecipientSelect('');
        return false;
      }
    } catch (err) {
      setError('Invalid Solana address');
      onRecipientSelect('');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = async (value: string) => {
    setInput(value);
    setError('');
    setShowDropdown(true);

    // Clear any pending validation
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    if (!value) {
      onRecipientSelect('');
      setSelectedPeerUsername(null);
      return;
    }

    // Debounce validation to avoid too many checks while typing
    validationTimeoutRef.current = setTimeout(async () => {
      await validateAndSelectAddress(value);
    }, 500);
  };

  const handlePeerSelect = async (peer: Peer) => {
    setInput(peer.publicKey);
    setSelectedPeerUsername(peer.nickname || peer.username || null);
    setShowDropdown(false);
    setError('');
    const isValid = await validateAndSelectAddress(peer.publicKey);
    if (isValid) {
      onRecipientSelect(peer.publicKey);
    }
  };

  const handleSetNickname = async (publicKey: string) => {
    if (!nicknameInput.trim()) return;
    
    await setPeerNickname(publicKey, nicknameInput.trim());
    setEditingNickname(null);
    setNicknameInput('');
    
    if (input === publicKey) {
      setSelectedPeerUsername(nicknameInput.trim());
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input && !error && !isValidating) {
      const isValid = await validateAndSelectAddress(input);
      if (isValid) {
        setShowDropdown(false);
      }
    }
  };

  const clearInput = () => {
    setInput('');
    setError('');
    setSelectedPeerUsername(null);
    setShowDropdown(false);
    onRecipientSelect('');
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder="Enter Solana address or search peers..."
          className={`w-full p-2 pr-20 border rounded-lg focus:outline-none focus:ring-2 ${
            error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
          }`}
          spellCheck={false}
          autoComplete="off"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {input && (
            <button
              onClick={clearInput}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              type="button"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <Search className={`w-4 h-4 ${isValidating ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
        </div>
      </div>

      {selectedPeerUsername && !error && (
        <p className="mt-1 text-sm text-gray-600">
          Sending to: {selectedPeerUsername}
        </p>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {showDropdown && filteredPeers.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredPeers.map((peer) => (
            <div
              key={peer.publicKey}
              className="p-2 hover:bg-gray-50 border-b last:border-b-0"
            >
              {editingNickname === peer.publicKey ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    placeholder="Enter nickname"
                    className="flex-1 p-1 border rounded"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSetNickname(peer.publicKey)}
                    className="p-1 hover:bg-blue-100 rounded-full"
                    type="button"
                  >
                    <Check className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => setEditingNickname(null)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                    type="button"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handlePeerSelect(peer)}
                    className="flex-1 text-left"
                    type="button"
                  >
                    <p className="font-medium">
                      {peer.nickname || peer.username || peer.publicKey.slice(0, 8)}...
                    </p>
                    <p className="text-sm text-gray-500">
                      {peer.publicKey.slice(0, 4)}...{peer.publicKey.slice(-4)}
                    </p>
                  </button>
                  <button
                    onClick={() => {
                      setEditingNickname(peer.publicKey);
                      setNicknameInput(peer.nickname || '');
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full ml-2"
                    title="Set nickname"
                    type="button"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};