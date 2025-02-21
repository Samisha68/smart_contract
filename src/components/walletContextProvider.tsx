// src/components/WalletContextProvider.tsx

'use client';

import { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { 
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  // We'll remove WalletConnect for now as it's causing issues
} from '@solana/wallet-adapter-wallets';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import type { WalletContextProviderProps } from '@/types/bijlee';

// We'll dynamically import the styles using a separate component
import dynamic from 'next/dynamic';

// Create a dynamic style provider component
const WalletStyleProvider = dynamic(
  () => import('./walletStylesprovider'),
  { ssr: false }
);

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ 
  children,
  endpoint = clusterApiUrl('devnet') // Default to devnet
}) => {
  // Initialize only stable and well-supported wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter()
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletStyleProvider>
            {children}
          </WalletStyleProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Export as a dynamic component to prevent SSR issues
export default dynamic(() => Promise.resolve(WalletContextProvider), {
  ssr: false
});