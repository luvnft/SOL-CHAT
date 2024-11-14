import { createHelia } from 'helia';
import { createLibp2p } from 'libp2p';
import { webSockets } from '@libp2p/websockets';
import { bootstrap } from '@libp2p/bootstrap';
import { MemoryBlockstore } from 'blockstore-core';
import { MemoryDatastore } from 'datastore-core';
import type { Helia } from '@helia/interface';

let heliaInstance: Helia | null = null;

const BOOTSTRAP_NODES = [
  '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
  '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
];

export async function getHelia() {
  if (!heliaInstance) {
    try {
      const blockstore = new MemoryBlockstore();
      const datastore = new MemoryDatastore();

      const libp2p = await createLibp2p({
        transports: [webSockets()],
        peerDiscovery: [
          bootstrap({
            list: BOOTSTRAP_NODES,
          }),
        ],
      });

      heliaInstance = await createHelia({
        libp2p,
        blockstore,
        datastore,
      });

      console.log('Helia instance created successfully');
    } catch (error) {
      console.error('Failed to create Helia instance:', error);
      throw error;
    }
  }
  return heliaInstance;
}