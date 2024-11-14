# Solana Chat

A secure, decentralized peer-to-peer messaging application built on Solana blockchain with end-to-end encryption and file sharing capabilities.

![Solana P2P Messenger](https://images.unsplash.com/photo-1587560699334-cc4ff634909a?auto=format&fit=crop&q=80&w=1200)

## Features

- **🔐 Secure Messaging**
  - End-to-end encryption using TweetNaCl
  - Messages stored locally with IPFS integration
  - Solana wallet-based authentication

- **👥 User Management**
  - Custom usernames and profiles
  - Recent peers list with activity status
  - Nickname support for contacts

- **📎 File Sharing**
  - Support for images and documents
  - Built-in image preview
  - Local file storage with IPFS integration

- **💫 Modern UI/UX**
  - Real-time message status updates
  - Responsive design
  - Image preview modal
  - Intuitive peer selection

## Tech Stack

- **Frontend**
  - React 18 with TypeScript
  - Tailwind CSS for styling
  - Vite for development and building

- **Blockchain**
  - Solana Web3.js
  - Wallet Adapter for Phantom integration

- **Storage & Encryption**
  - IPFS/Helia for decentralized storage
  - TweetNaCl for encryption
  - LocalStorage for persistent data

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A Solana wallet (e.g., Phantom)
- Git (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AP3X/SOL-CHAT.git
cd solana-p2p-messenger
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Configuration

Create a `.env` file in the root directory:

```env
VITE_WEB3_STORAGE_EMAIL=your_email@example.com
VITE_WEB3_STORAGE_SPACE=your_space_did
```

## Usage

1. **Connect Wallet**
   - Click "Select Wallet" to connect your Solana wallet
   - Set up your username when prompted

2. **Send Messages**
   - Enter recipient's Solana address or select from recent peers
   - Type your message and/or attach files
   - Click send button to encrypt and transmit

3. **Manage Contacts**
   - Click the users icon to view recent peers
   - Set nicknames for easy identification
   - Monitor peer activity status

4. **Share Files**
   - Click the paperclip icon to attach files
   - Supported formats: images, PDFs, documents
   - Preview images before sending

## Security Features

- **Encryption**: All messages are encrypted using TweetNaCl's box encryption
- **Authentication**: Wallet-based authentication ensures message integrity
- **Storage**: Messages are stored locally with optional IPFS backup
- **Privacy**: Direct peer-to-peer communication with no central server

## Development

### Project Structure

```
src/
├── components/        # React components
├── lib/              # Core functionality
│   ├── crypto.ts     # Encryption utilities
│   ├── ipfs.ts       # IPFS integration
│   ├── peers.ts      # Peer management
│   ├── profile.ts    # User profiles
│   └── storage.ts    # Data persistence
├── types/            # TypeScript definitions
└── App.tsx           # Main application
```

### Building

```bash
npm run build
```

The built files will be in the `dist` directory.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Solana Foundation for blockchain infrastructure
- IPFS for decentralized storage capabilities
- The Web3 community for inspiration and support

## Support

For support, please open an issue in the GitHub repository or reach out to the maintainers.

---

Built with ❤️ by AP3X