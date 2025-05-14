import { PublicKey } from '@solana/web3.js';
import { encode as encodeBase58, decode as decodeBase58 } from 'bs58';
import { encode as encodeUTF8, decode as decodeUTF8 } from '@stablelib/utf8';
import { box, randomBytes, BoxKeyPair } from 'tweetnacl';

export async function encryptMessage(
  message: string,
  senderPrivateKey: Uint8Array,
  recipientPublicKey: PublicKey
): Promise<{ encrypted: string; nonce: string }> {
  // Generate a one-time keypair for this encryption
  const ephemeralKeyPair = box.keyPair();
  const nonce = randomBytes(box.nonceLength);

  // Convert message to Uint8Array
  const messageUint8 = encodeUTF8(message);

  // Convert recipient public key to Uint8Array
  const recipientPubKeyUint8 = recipientPublicKey.toBytes();

  // Encrypt the message
  const encryptedMessage = box(
    messageUint8,
    nonce,
    recipientPubKeyUint8,
    ephemeralKeyPair.secretKey
  );

  // Return the encrypted message and nonce as base58 strings
  return {
    encrypted: encodeBase58(encryptedMessage),
    nonce: encodeBase58(nonce),
  };
}

export async function decryptMessage(
  encryptedBase58: string,
  nonceBase58: string,
  senderPublicKey: PublicKey,
  recipientPrivateKey: Uint8Array
): Promise<string | null> {
  try {
    // Convert base58 strings back to Uint8Array
    const encryptedUint8 = decodeBase58(encryptedBase58);
    const nonceUint8 = decodeBase58(nonceBase58);
    const senderPubKeyUint8 = senderPublicKey.toBytes();

    // Decrypt the message
    const decrypted = box.open(
      encryptedUint8,
      nonceUint8,
      senderPubKeyUint8,
      recipientPrivateKey
    );

    // If decryption failed, return null
    if (!decrypted) return null;

    // Convert decrypted message from Uint8Array to string
    return decodeUTF8(decrypted);
  } catch (error) {
    console.error('Error decrypting message:', error);
    return null;
  }
}