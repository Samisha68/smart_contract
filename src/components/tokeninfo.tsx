// src/components/TokenInfo.tsx

'use client';

import { FC, useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { TokenAccountInfo, TokenMetadata } from '@/types/bijlee';

// Replace with your token's mint address
const BIJLEE_TOKEN_MINT = new PublicKey('HQbqWP4LSUYLySNXP8gRbXuKRy6bioH15CsrePQnfT86');

export const TokenInfo: FC = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [tokenAccount, setTokenAccount] = useState<TokenAccountInfo | null>(null);
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) return;

    const fetchTokenInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get associated token account
        const tokenAddress = await getAssociatedTokenAddress(
          BIJLEE_TOKEN_MINT,
          publicKey
        );

        // Fetch token account info
        const accountInfo = await getAccount(connection, tokenAddress);

        setTokenAccount({
          mint: accountInfo.mint,
          owner: accountInfo.owner,
          amount: Number(accountInfo.amount),
          decimals: accountInfo.mint.decimals
        });

        // Here you would typically fetch token metadata from your program
        // This is a placeholder
        setMetadata({
          name: 'Bijlee Token',
          symbol: 'BIJ',
          totalSupply: 1000000
        });

      } catch (err) {
        console.error('Error fetching token info:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch token info');
      } finally {
        setLoading(false);
      }
    };

    fetchTokenInfo();
  }, [publicKey, connection]);

  if (!publicKey) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        Please connect your wallet to view token information.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        Loading token information...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Token Information</h2>
      
      {tokenAccount && (
        <div className="space-y-2">
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Balance:</span>
            <span>{tokenAccount.amount}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Decimals:</span>
            <span>{tokenAccount.decimals}</span>
          </div>
        </div>
      )}

      {metadata && (
        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="flex justify-between py-2">
            <span className="font-medium">Name:</span>
            <span>{metadata.name}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium">Symbol:</span>
            <span>{metadata.symbol}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium">Total Supply:</span>
            <span>{metadata.totalSupply.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenInfo;