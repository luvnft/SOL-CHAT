import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
      supported: { 
        bigint: true 
      },
    },
    include: [
      '@solana/web3.js',
      'bs58',
      '@stablelib/utf8',
      'tweetnacl',
      'buffer',
      'events',
      'process'
    ]
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'solana-wallet': [
            '@solana/wallet-adapter-base',
            '@solana/wallet-adapter-phantom',
            '@solana/wallet-adapter-react',
            '@solana/wallet-adapter-react-ui',
            '@solana/web3.js'
          ]
        }
      }
    }
  },
  resolve: {
    alias: {
      'node:buffer': 'buffer',
      'node:process': 'process/browser',
      'node:events': 'events'
    }
  }
});