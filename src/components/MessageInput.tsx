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
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t space-y-4">
      <RecipientInput
        onRecipientSelect={setRecipientAddress}
        recentPeers={recentPeers}
      />
      
      {selectedFile && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          {filePreviewUrl ? (
            <div className="relative w-16 h-16">
              <img
                src={filePreviewUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              <ImageIcon className="absolute bottom-1 right-1 w-4 h-4 text-white drop-shadow-lg" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            title="Remove file"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Attach file"
          disabled={sending}
        >
          <Paperclip className="w-5 h-5 text-gray-500" />
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
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          disabled={sending}
        />
        <button
          type="submit"
          className={`p-2 text-white rounded-full transition-colors ${
            sending || !recipientAddress || (!message.trim() && !selectedFile)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
          disabled={sending || !recipientAddress || (!message.trim() && !selectedFile)}
          title={sending ? 'Sending...' : 'Send message'}
        >
          <Send className={`w-5 h-5 ${sending ? 'animate-pulse' : ''}`} />
        </button>
      </div>
    </form>
  );
};