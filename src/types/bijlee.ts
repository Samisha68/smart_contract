// src/types/bijlee.ts
import { PublicKey } from '@solana/web3.js';
import { ReactNode } from 'react';

// Types for wallet context provider
export interface WalletContextProviderProps {
  children: ReactNode;
  endpoint?: string;
}

// Types for token info component
export interface TokenAccountInfo {
  mint: PublicKey;
  owner: PublicKey;
  amount: number;
  decimals: number;
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  totalSupply: number;
}

// Types for transaction status
export type TransactionStatus = 'idle' | 'processing' | 'success' | 'error';

// Types for transfer result
export interface TransferResult {
  status: TransactionStatus;
  signature?: string;
  error?: string;
}