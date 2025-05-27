import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { PeerList } from './components/PeerList';
import { ProfileSetup } from './components/ProfileSetup';
import { WalletContextProvider } from './components/WalletContextProvider';
import { ThemeToggle, useTheme } from './components/ThemeProvider';
import { MessageCircle, Users, Loader2, X } from 'lucide-react';
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
  const [showPeers, setShowPeers] = useState(true);
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

      // For demo purposes, we'll use a simplified approach
      // In a real app, we would use proper key derivation
      const messageSignature = await signMessage(new TextEncoder().encode('Sign to encrypt message'));

      // Generate a deterministic key from the signature
      // This is a simplified approach for demo purposes
      const { encrypted, nonce } = await encryptMessage(
        content,
        messageSignature,
        new PublicKey(recipientPublicKey)
      );

      const newMessage: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender: publicKey.toString(),
        senderUsername: profile.username,
        recipient: recipientPublicKey,
        content: content, // Store unencrypted for demo
        encrypted, // Store encrypted version
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

  const { theme } = useTheme();

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="SOL-CHAT Logo" className="w-32 h-auto mb-4" />
          <h1 className="mb-2 text-4xl font-bold text-text">
            🌊 WATAA.MENU
          </h1>
          <p className="text-text-muted">
            Secure messaging on Solana Powered By $WATAA Tips
          </p>
        </div>

        <div className="w-full max-w-md p-8 space-y-6 text-center card animate-fade-in shadow-elevation-2 border-border">
          <h2 className="text-2xl font-bold text-text">
            Welcome
          </h2>
          <p className="text-text-muted">
            Connect your wallet to start messaging securely with other users.
          </p>
          <div className="flex justify-center">
            <WalletMultiButton className="!bg-gradient-tertiary hover:opacity-90 transition-opacity !rounded-lg" />
          </div>
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <ProfileSetup
          publicKey={publicKey.toString()}
          onComplete={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 border-b shadow-sm bg-foreground border-border">
        <div className="flex items-center justify-between mx-auto max-w-7xl">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="WATAA.MENU Logo" className="w-auto h-8" />
            <h1 className="text-xl font-bold text-text">🌊 WATAA.MENU</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-card-highlight px-3 py-1.5 rounded-lg">
              <span className="text-sm text-text-muted">
                <span className="font-medium text-text">{profile.username}</span>
              </span>
            </div>
            <button
              onClick={() => setShowPeers(!showPeers)}
              className="rounded-lg btn-icon hover:bg-card-highlight"
              aria-label="Show peers"
            >
              <Users className="w-5 h-5 text-text-muted" />
            </button>
            <ThemeToggle />
            <WalletMultiButton className="!bg-gradient-tertiary hover:opacity-90 transition-opacity !rounded-lg" />
          </div>
        </div>
      </header>

      <main className="flex flex-col flex-1 w-full gap-6 p-4 mx-auto my-6 max-w-7xl md:flex-row">
        <div className="flex flex-col flex-1 space-y-6">
          {/* Quick Actions */}
          <div className="p-5 card shadow-elevation-2 border-border">
            <h2 className="mb-4 font-semibold text-text">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <button
                className="relative flex flex-col items-center justify-center p-4 transition-colors rounded-lg bg-card-highlight hover:bg-opacity-80"
                onClick={() => alert("This feature is coming soon!")}
              >
                <div className="p-2 mb-2 rounded-lg bg-gradient-primary">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">New Chat</span>
                <span className="absolute top-2 right-2 text-xs px-1.5 py-0.5 bg-gradient-primary text-white rounded-full">Soon</span>
              </button>
              <button
                className="relative flex flex-col items-center justify-center p-4 transition-colors rounded-lg bg-card-highlight hover:bg-opacity-80"
                onClick={() => alert("This feature is coming soon!")}
              >
                <div className="p-2 mb-2 rounded-lg bg-gradient-secondary">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">My Contacts</span>
                <span className="absolute top-2 right-2 text-xs px-1.5 py-0.5 bg-gradient-secondary text-white rounded-full">Soon</span>
              </button>
              <button
                className="relative flex flex-col items-center justify-center p-4 transition-colors rounded-lg bg-card-highlight hover:bg-opacity-80"
                onClick={() => alert("This feature is coming soon!")}
              >
                <div className="p-2 mb-2 rounded-lg bg-gradient-tertiary">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">Messages</span>
                <span className="absolute top-2 right-2 text-xs px-1.5 py-0.5 bg-gradient-tertiary text-white rounded-full">Soon</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex flex-col flex-1 card shadow-elevation-2 border-border">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-text">Messages</h2>
            </div>
            <MessageList
              messages={messages}
              currentWallet={publicKey.toString()}
            />
            <MessageInput
              onSendMessage={handleSendMessage}
              recentPeers={recentPeers}
            />
          </div>
        </div>

        <div className={`w-full md:w-80 card shadow-elevation-2 overflow-hidden border-border ${showPeers ? 'animate-slide-in' : 'hidden'}`}>
          <div className="p-4 border-b bg-foreground border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-secondary p-1.5 rounded-lg">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-semibold text-text">Recent Peers</h2>
              </div>
              <button
                onClick={() => setShowPeers(false)}
                className="p-1 rounded-lg md:hidden hover:bg-card-highlight"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>
          </div>
          <PeerList
            onSelectPeer={(peer) => {
              setShowPeers(false);
            }}
          />
        </div>
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