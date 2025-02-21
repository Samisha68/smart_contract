// src/components/BijleeTransferButton.tsx

'use client';

import { FC, useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';
import { TransferButtonProps, TransferState } from '@/types/bijlee';

const BIJLEE_TOKEN_MINT = new PublicKey('HQbqWP4LSUYLySNXP8gRbXuKRy6bioH15CsrePQnfT86');

export const BijleeTransferButton: FC<TransferButtonProps> = ({
  onSuccess,
  onError,
  className = ''
}) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [state, setState] = useState<TransferState>({
    isLoading: false,
    amount: '',
    recipient: '',
    error: null,
    success: false
  });

  const resetState = () => {
    setState({
      isLoading: false,
      amount: '',
      recipient: '',
      error: null,
      success: false
    });
  };

  const handleTransfer = useCallback(async () => {
    if (!publicKey) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Validate recipient address
      const recipientPubKey = new PublicKey(state.recipient);

      // Get token accounts
      const senderTokenAccount = await getAssociatedTokenAddress(
        BIJLEE_TOKEN_MINT,
        publicKey
      );

      const recipientTokenAccount = await getAssociatedTokenAddress(
        BIJLEE_TOKEN_MINT,
        recipientPubKey
      );

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        publicKey,
        BigInt(parseFloat(state.amount)),
      );

      // Create and send transaction
      const transaction = new Transaction().add(transferInstruction);
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      setState(prev => ({ ...prev, success: true }));
      onSuccess?.();

    } catch (error) {
      console.error('Transfer failed:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Transfer failed' 
      }));
      onError?.(error instanceof Error ? error : new Error('Transfer failed'));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [publicKey, connection, sendTransaction, state.amount, state.recipient, onSuccess, onError]);

  if (!publicKey) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <input
          type="text"
          value={state.recipient}
          onChange={(e) => setState(prev => ({ ...prev, recipient: e.target.value }))}
          placeholder="Recipient Address"
          className="w-full px-3 py-2 border rounded-md"
          disabled={state.isLoading}
        />
        <input
          type="number"
          value={state.amount}
          onChange={(e) => setState(prev => ({ ...prev, amount: e.target.value }))}
          placeholder="Amount"
          className="w-full px-3 py-2 border rounded-md"
          disabled={state.isLoading}
        />
      </div>

      <button
        onClick={handleTransfer}
        disabled={state.isLoading || !state.amount || !state.recipient}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md
                 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {state.isLoading ? 'Processing...' : 'Transfer Tokens'}
      </button>

      {state.error && (
        <div className="text-red-600 text-sm">{state.error}</div>
      )}

      {state.success && (
        <div className="text-green-600 text-sm">Transfer successful!</div>
      )}
    </div>
  );
};

export default BijleeTransferButton;