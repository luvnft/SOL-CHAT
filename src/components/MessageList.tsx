import React, { useState } from 'react';
import { MessageSquare, FileText, CheckCircle, Clock, ExternalLink, Image as ImageIcon, X } from 'lucide-react';
import type { Message } from '../types/message';

interface Props {
  messages: Message[];
  currentWallet: string;
}

export const MessageList: React.FC<Props> = ({ messages, currentWallet }) => {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return <Clock className="w-3 h-3" />;
      case 'delivered':
        return <CheckCircle className="w-3 h-3 text-blue-500" />;
      case 'read':
        return (
          <div className="flex -space-x-1">
            <CheckCircle className="w-3 h-3 text-blue-500" />
            <CheckCircle className="w-3 h-3 text-blue-500" />
          </div>
        );
    }
  };

  const isImageUrl = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const renderFilePreview = (fileUrl: string, fileName?: string) => {
    if (isImageUrl(fileUrl)) {
      return (
        <div className="mt-2 relative">
          <img
            src={fileUrl}
            alt={fileName || 'Shared image'}
            className="max-w-[300px] max-h-[200px] rounded-lg cursor-pointer object-cover"
            onClick={() => setExpandedImage(fileUrl)}
          />
        </div>
      );
    }

    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 mt-2 text-current opacity-80 hover:opacity-100"
      >
        <FileText className="w-4 h-4" />
        <span className="text-sm underline">
          {fileName || 'Download File'}
        </span>
        <ExternalLink className="w-3 h-3" />
      </a>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <MessageSquare className="w-12 h-12 mb-2" />
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === currentWallet ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender === currentWallet
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {message.senderUsername ? (
                  <span className="text-sm font-medium">
                    {message.senderUsername}
                  </span>
                ) : (
                  <span className="text-xs opacity-75">
                    {message.sender.slice(0, 4)}...{message.sender.slice(-4)}
                  </span>
                )}
              </div>
              
              {message.content && (
                <p className="break-words whitespace-pre-wrap">{message.content}</p>
              )}
              
              {message.fileUrl && renderFilePreview(message.fileUrl, message.fileName)}
              
              <div className="flex items-center justify-between mt-2 text-xs opacity-75">
                <span>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
                {message.sender === currentWallet && (
                  <div className="ml-2">{getStatusIcon(message.status)}</div>
                )}
              </div>
            </div>
          </div>
        ))
      )}

      {/* Image Preview Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute -top-4 -right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={expandedImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};