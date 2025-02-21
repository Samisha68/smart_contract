// src/types/bijlee.ts

import { PublicKey } from '@solana/web3.js';

// Interface for token transfer state management
export interface TransferState {
  isLoading: boolean;
  amount: string;
  recipient: string;
  error: string | null;
  success: boolean;
}

// Interface for token account information
export interface TokenAccountInfo {
  mint: PublicKey;
  owner: PublicKey;
  amount: number;
  decimals: number;
}

// Interface for token metadata
export interface TokenMetadata {
  name: string;
  symbol: string;
  totalSupply: number;
}

// Props for the transfer button component
export interface TransferButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

// Props for the wallet context provider
export interface WalletContextProviderProps {
  children: React.ReactNode;
  endpoint?: string;
}

// Interface for transaction results
export interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}