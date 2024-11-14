import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { PeerList } from './components/PeerList';
import { ProfileSetup } from './components/ProfileSetup';
import { WalletContextProvider } from './components/WalletContextProvider';
import { MessageCircle, Users } from 'lucide-react';
import { uploadFile, storeMessages, retrieveMessages } from './lib/storage';
import { encryptMessage } from './lib/crypto';
import { addRecentPeer, getRecentPeers, getAddressActivity } from './lib/peers';
import { getLocalProfile } from './lib/profile';
import type { Message, Peer, UserProfile } from './types/message';

function MessengerApp() {
  const { publicKey, signMessage } = useWallet();
  const { connection } = useConnection();
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastCid, setLastCid] = useState<string | null>(null);
  const [showPeers, setShowPeers] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentPeers, setRecentPeers] = useState<Peer[]>([]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (publicKey) {
        const userProfile = await getLocalProfile();
        setProfile(userProfile);
        
        const peers = await getRecentPeers();
        setRecentPeers(peers);

        // Load messages from local storage
        const storedMessages = await retrieveMessages(null);
        if (storedMessages.length > 0) {
          // Filter messages for the current user
          const userMessages = storedMessages.filter(
            msg => msg.sender === publicKey.toString() || msg.recipient === publicKey.toString()
          );
          setMessages(userMessages);
        }
      }
    };
    loadInitialData();
  }, [publicKey]);

  // Poll for message status updates
  useEffect(() => {
    if (!publicKey || !connection) return;

    const interval = setInterval(async () => {
      const updatedMessages = await Promise.all(
        messages.map(async (message) => {
          if (message.sender === publicKey.toString() && message.status === 'sent') {
            try {
              const { active } = await getAddressActivity(connection, message.recipient);
              if (active) {
                return { ...message, status: 'delivered' };
              }
            } catch {
              // Keep existing status if check fails
            }
          }
          return message;
        })
      );

      if (JSON.stringify(updatedMessages) !== JSON.stringify(messages)) {
        setMessages(updatedMessages);
        await storeMessages(updatedMessages);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [publicKey, messages, connection]);

  const handleSendMessage = async (content: string, recipientPublicKey: string, file?: File) => {
    if (!publicKey || !signMessage || !profile) return;

    try {
      let fileUrl;
      let fileName;
      if (file) {
        fileUrl = await uploadFile(file);
        fileName = file.name;
      }

      const { encrypted, nonce } = await encryptMessage(
        content,
        await signMessage(new TextEncoder().encode('Sign to encrypt message')),
        new PublicKey(recipientPublicKey)
      );

      const newMessage: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender: publicKey.toString(),
        senderUsername: profile.username,
        recipient: recipientPublicKey,
        content: content, // Store unencrypted for demo
        nonce,
        timestamp: Date.now(),
        fileUrl,
        fileName,
        status: 'sent'
      };

      // Update messages state immediately
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);

      // Store messages
      await storeMessages(updatedMessages);

      // Update recent peers
      await addRecentPeer(recipientPublicKey);
      const updatedPeers = await getRecentPeers();
      setRecentPeers(updatedPeers);

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <MessageCircle className="w-16 h-16 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Solana P2P Messenger
          </h1>
          <p className="text-gray-600">
            Connect your wallet to start messaging securely with other users.
          </p>
          <WalletMultiButton className="!bg-blue-500 hover:!bg-blue-600 transition-colors" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <ProfileSetup
        publicKey={publicKey.toString()}
        onComplete={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-8 h-8 text-blue-500" />
            <h1 className="text-xl font-bold text-gray-900">P2P Messenger</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Logged in as: <span className="font-medium">{profile.username}</span>
            </span>
            <button
              onClick={() => setShowPeers(!showPeers)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Users className="w-6 h-6 text-gray-600" />
            </button>
            <WalletMultiButton className="!bg-blue-500 hover:!bg-blue-600 transition-colors" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full my-4 flex gap-4 p-4">
        <div className="flex-1 bg-white shadow-lg rounded-lg flex flex-col">
          <MessageList 
            messages={messages} 
            currentWallet={publicKey.toString()} 
          />
          <MessageInput 
            onSendMessage={handleSendMessage}
            recentPeers={recentPeers}
          />
        </div>
        
        {showPeers && (
          <div className="w-80 bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="font-semibold text-gray-900">Recent Peers</h2>
            </div>
            <PeerList 
              onSelectPeer={(peer) => {
                setShowPeers(false);
              }} 
            />
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <WalletContextProvider>
      <MessengerApp />
    </WalletContextProvider>
  );
}

export default App;