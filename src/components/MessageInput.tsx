import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, FileText } from 'lucide-react';
import { RecipientInput } from './RecipientInput';
import type { Peer } from '../types/message';

interface Props {
  onSendMessage: (content: string, recipientPublicKey: string, file?: File) => Promise<void>;
  recentPeers: Peer[];
}

export const MessageInput: React.FC<Props> = ({ onSendMessage, recentPeers }) => {
  const [message, setMessage] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientAddress || (!message.trim() && !selectedFile) || sending) {
      return;
    }

    try {
      setSending(true);
      await onSendMessage(message.trim(), recipientAddress, selectedFile || undefined);

      // Clear form after successful send
      setMessage('');
      setSelectedFile(null);
      setFilePreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setFilePreviewUrl(url);
      } else {
        setFilePreviewUrl(null);
      }
    }
  };

  const clearFile = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setSelectedFile(null);
    setFilePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-foreground border-t border-border space-y-4">
      <RecipientInput
        onRecipientSelect={setRecipientAddress}
        recentPeers={recentPeers}
      />

      {selectedFile && (
        <div className="flex items-center gap-2 p-2 bg-card-highlight rounded-lg border border-border animate-fade-in">
          {filePreviewUrl ? (
            <div className="relative w-16 h-16">
              <img
                src={filePreviewUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute bottom-1 right-1 bg-gradient-primary p-1 rounded-full">
                <ImageIcon className="w-3 h-3 text-white" />
              </div>
            </div>
          ) : (
            <div className="w-16 h-16 bg-card-highlight rounded-lg flex items-center justify-center border border-border">
              <div className="bg-gradient-secondary p-1.5 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-text-muted">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="btn-icon hover:bg-card-highlight rounded-lg"
            title="Remove file"
            aria-label="Remove file"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn-icon hover:bg-card-highlight rounded-lg"
          title="Attach file"
          aria-label="Attach file"
          disabled={sending}
        >
          <Paperclip className="w-5 h-5 text-text-muted" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx,.txt"
        />
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="input flex-1 bg-card-highlight border-border"
          disabled={sending}
        />
        <button
          type="submit"
          className={`p-2 rounded-lg ${
            sending || !recipientAddress || (!message.trim() && !selectedFile)
              ? 'bg-card-highlight cursor-not-allowed opacity-50'
              : 'bg-gradient-tertiary hover:opacity-90 transition-opacity'
          }`}
          disabled={sending || !recipientAddress || (!message.trim() && !selectedFile)}
          title={sending ? 'Sending...' : 'Send message'}
          aria-label={sending ? 'Sending...' : 'Send message'}
        >
          <Send className={`w-5 h-5 text-white ${sending ? 'animate-pulse' : ''}`} />
        </button>
      </div>
    </form>
  );
};