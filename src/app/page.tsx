// src/app/page.tsx

'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import TokenInfo from '../components/tokeninfo';
import BijleeTransferButton from '@/components/BijleeTransferButton';
import { WalletContextProvider } from '../components/walletContextProvider';

export default function Home() {
  return (
    <WalletContextProvider>
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Bijlee Token Dashboard</h1>
          <WalletMultiButton />
        </div>

        <div className="grid gap-8">
          <TokenInfo />
          <BijleeTransferButton 
            onSuccess={() => console.log('Transfer successful')}
            onError={(error) => console.error('Transfer failed:', error)}
          />
        </div>
      </main>
    </WalletContextProvider>
  );
}