import { PublicKey } from '@solana/web3.js';
import { encode as encodeBase58 } from 'bs58';
import { encode as encodeUTF8 } from '@stablelib/utf8';
import { Box, randomBytes } from 'tweetnacl';

export async function encryptMessage(
  message: string,
  senderPrivateKey: Uint8Array,
  recipientPublicKey: PublicKey
): Promise<{ encrypted: string; nonce: string }> {
  const ephemeralKeyPair = Box.keyPair();
  const nonce = randomBytes(Box.nonceLength);
  
  const encryptedMessage = Box(
    encodeUTF8(message),
    nonce,
    recipientPublicKey.toBytes(),
    ephemeralKeyPair.secretKey
  );

  return {
    encrypted: encodeBase58(encryptedMessage),
    nonce: encodeBase58(nonce),
  };
}