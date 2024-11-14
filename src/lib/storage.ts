import type { Message } from '../types/message';

const MESSAGES_STORAGE_KEY = 'local_messages';

export async function uploadFile(file: File): Promise<string> {
  try {
    // Store locally using URL.createObjectURL
    const localUrl = URL.createObjectURL(file);
    return localUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function storeMessages(messages: Message[]): Promise<string> {
  try {
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    return 'local';
  } catch (error) {
    console.error('Error storing messages:', error);
    return '';
  }
}

export async function retrieveMessages(cid: string | null): Promise<Message[]> {
  try {
    const localMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
    return localMessages ? JSON.parse(localMessages) : [];
  } catch (error) {
    console.error('Error retrieving messages:', error);
    return [];
  }
}