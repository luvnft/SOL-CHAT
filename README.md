# SOL-CHAT

A secure, decentralized peer-to-peer messaging application built on Solana blockchain with end-to-end encryption and file sharing capabilities.

![SOL-CHAT Screenshot](https://raw.githubusercontent.com/AP3X-Dev/SOL-CHAT/refs/heads/main/public/screencapture.png)

## Overview

SOL-CHAT is a modern messaging platform that leverages Solana blockchain technology to provide secure, decentralized communication. With its sleek dark mode UI and powerful encryption features, SOL-CHAT offers a private and user-friendly messaging experience for Solana users.

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
  - Sleek dark mode with Solana-inspired gradients
  - Real-time message status updates
  - Responsive design for desktop and mobile
  - Interactive image preview modal
  - Intuitive peer selection with recent contacts panel
  - Quick action buttons for common tasks

## Tech Stack

- **Frontend**
  - React 18 with TypeScript for a robust component-based architecture
  - Tailwind CSS for responsive and customized styling
  - Lucide React for consistent, high-quality icons
  - Vite for fast development and optimized builds

- **Blockchain Integration**
  - Solana Web3.js for blockchain interactions
  - Wallet Adapter for seamless Phantom wallet integration
  - Public key-based user identification

- **Security & Storage**
  - TweetNaCl for military-grade end-to-end encryption
  - IPFS/Helia for decentralized file storage
  - LocalStorage for efficient message persistence and offline access
  - Message signing for authentication and integrity verification

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A Solana wallet (e.g., Phantom)
- Git (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AP3X-Dev/SOL-CHAT.git
cd SOL-CHAT
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

### Configuration (Optional)

For IPFS integration, create a `.env` file in the root directory:

```env
VITE_WEB3_STORAGE_EMAIL=your_email@example.com
VITE_WEB3_STORAGE_SPACE=your_space_did
```

Note: The application works without IPFS configuration, but file storage will be limited to local storage.

## Usage

1. **Connect Wallet**
   - Click the "Select Wallet" button on the welcome screen
   - Approve the connection in your Phantom wallet
   - Set up your username when prompted to complete your profile

2. **Navigate the Interface**
   - View your recent conversations in the main panel
   - Browse quick actions for upcoming features (marked with "Soon" indicators)
   - See your recent peers in the side panel (open by default)
   - Toggle dark/light mode with the theme button in the header

3. **Send Messages**
   - Enter recipient's Solana address or select from recent peers
   - Type your message in the input field
   - Click the send button (gradient arrow) to encrypt and transmit
   - View message status indicators for sent messages

4. **Manage Contacts**
   - Browse your recent peers in the side panel
   - Set nicknames for easy identification by clicking the edit icon
   - Monitor peer activity status with the status indicators
   - Click on a peer to start a new conversation

5. **Share Files**
   - Click the paperclip icon to attach files
   - Supported formats: images, PDFs, documents, text files
   - Preview images directly in the chat
   - Click on images to view them in the full-screen modal

## Security Features

- **End-to-End Encryption**: All messages are encrypted using TweetNaCl's box encryption with public/private key pairs
- **Blockchain Authentication**: Wallet-based authentication ensures message integrity and sender verification
- **Decentralized Storage**: Messages are stored locally with optional IPFS backup for enhanced privacy
- **No Central Server**: Direct peer-to-peer communication model eliminates central points of failure
- **Message Signing**: Digital signatures verify the authenticity of each message
- **Local Data**: Sensitive information never leaves your device without encryption

## Development

### Project Structure

```
SOL-CHAT/
├── public/                # Static assets
│   ├── logo.png           # Application logo
│   └── solana-icon.svg    # Solana icon
├── src/
│   ├── components/        # React components
│   │   ├── MessageInput.tsx    # Message composition
│   │   ├── MessageList.tsx     # Conversation display
│   │   ├── PeerList.tsx        # Contact management
│   │   ├── ProfileSetup.tsx    # User onboarding
│   │   ├── RecipientInput.tsx  # Address selection
│   │   ├── ThemeProvider.tsx   # Dark/light mode
│   │   └── WalletContextProvider.tsx  # Wallet integration
│   ├── lib/               # Core functionality
│   │   ├── crypto.ts      # Encryption utilities
│   │   ├── ipfs.ts        # IPFS integration
│   │   ├── peers.ts       # Peer management
│   │   ├── profile.ts     # User profiles
│   │   └── storage.ts     # Data persistence
│   ├── types/             # TypeScript definitions
│   ├── App.tsx            # Main application
│   ├── index.css          # Global styles
│   └── main.tsx           # Application entry point
└── tailwind.config.js     # Tailwind CSS configuration
```

### Building for Production

```bash
npm run build
```

The optimized production build will be generated in the `dist` directory, ready for deployment to your preferred hosting service.

## Key UI Features

- **Dark Mode**: Sleek dark theme with Solana-inspired gradient accents
- **Responsive Design**: Fully responsive layout that works on desktop and mobile devices
- **Interactive Elements**: Smooth animations and transitions for a polished user experience
- **Accessibility**: High contrast text and interactive elements for better readability
- **Intuitive Navigation**: Clear visual hierarchy and consistent UI patterns

## Roadmap

The following features are planned for future development:

- **New Chat**: Streamlined interface for starting new conversations with any Solana address
- **Contacts Management**: Advanced contact organization with groups and favorites
- **Message Archive**: Searchable history of all conversations with filtering options
- **Group Messaging**: Create chat rooms with multiple participants
- **Enhanced File Sharing**: Support for larger files and more formats
- **Profile Customization**: Additional profile settings and avatar support

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Solana Foundation for blockchain infrastructure and inspiration
- IPFS for decentralized storage capabilities
- TailwindCSS team for the excellent styling framework
- Lucide for the beautiful icon set
- The Web3 community for ongoing support and innovation

## Support

For support, please open an issue in the GitHub repository or reach out to the maintainers.

---

Built with ❤️ by AP3X-Dev