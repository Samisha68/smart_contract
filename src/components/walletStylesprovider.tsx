// src/components/WalletStyleProvider.tsx

'use client';

import { FC, useEffect } from 'react';

const WalletStyleProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Import wallet styles on the client side only
    require('@solana/wallet-adapter-react-ui/styles.css');
  }, []);

  return <>{children}</>;
};

export default WalletStyleProvider;