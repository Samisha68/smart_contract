'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { executeTokenTransfer } from '../app/utils/tokenOperations';

interface BijleeTransferButtonProps {
  recipientAddress: string;
  amount: number;
  onSuccess?: (signature: string) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: 'idle' | 'processing' | 'success' | 'error') => void;
  className?: string;
  label?: string;
  refreshTokenInfo?: () => Promise<void>;
}

const BijleeTransferButton = ({
  recipientAddress,
  amount,
  onSuccess,
  onError,
  onStatusChange,
  className = '',
  label = 'Send BIJLEE',
  refreshTokenInfo
}: BijleeTransferButtonProps) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTransfer = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    if (!recipientAddress) {
      alert('Recipient address is required');
      return;
    }

    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setTransactionStatus('processing');
    
    if (onStatusChange) {
      onStatusChange('processing');
    }

    try {
      const signature = await executeTokenTransfer(
        connection,
        wallet,
        recipientAddress,
        amount
      );

      setTransactionSignature(signature);
      setTransactionStatus('success');
      
      if (onStatusChange) {
        onStatusChange('success');
      }
      
      if (onSuccess) {
        onSuccess(signature);
      }
      
      // Refresh token info if provided
      if (refreshTokenInfo) {
        setTimeout(refreshTokenInfo, 2000); // Give blockchain time to update
      }
      
    } catch (error) {
      console.error('Transaction failed:', error);
      
      setTransactionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      
      if (onStatusChange) {
        onStatusChange('error');
      }
      
      if (error instanceof Error && onError) {
        onError(error);
      } else {
        alert(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
        onClick={handleTransfer}
        disabled={isLoading || !wallet.connected}
      >
        {isLoading ? 'Processing...' : label}
      </button>
      
      {transactionStatus === 'processing' && (
        <div className="mt-3 p-3 bg-blue-50 rounded-md text-blue-700">
          <p>Processing transaction... Please wait</p>
        </div>
      )}
      
      {transactionStatus === 'success' && transactionSignature && (
        <div className="mt-3 p-3 bg-green-50 rounded-md">
          <p className="text-green-700 font-medium">Transaction Successful!</p>
          <p className="text-sm text-green-600 mt-1">
            Your tokens have been sent successfully.
          </p>
          <div className="mt-2">
            <a 
              href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              View transaction on Solana Explorer
            </a>
          </div>
        </div>
      )}
      
      {transactionStatus === 'error' && (
        <div className="mt-3 p-3 bg-red-50 rounded-md">
          <p className="text-red-700 font-medium">Transaction Failed</p>
          <p className="text-sm text-red-600 mt-1">{errorMessage || 'An unknown error occurred'}</p>
        </div>
      )}
    </div>
  );
};

export default BijleeTransferButton;