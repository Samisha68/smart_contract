'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { executeTokenTransfer } from '../app/utils/tokenOperations';
import TokenInfo from './tokeninfo';

interface BijleeTransferFormProps {
  onSuccess?: (signature: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

const BijleeTransferForm: React.FC<BijleeTransferFormProps> = ({
  onSuccess,
  onError,
  className = ''
}) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Reference to TokenInfo component for refreshing
  const [tokenInfoKey, setTokenInfoKey] = useState(0);
  
  // Reset status when wallet changes
  useEffect(() => {
    setTransactionStatus('idle');
    setTransactionSignature(null);
    setErrorMessage(null);
  }, [wallet.publicKey]);
  
  const refreshTokenInfo = () => {
    // This forces the TokenInfo component to re-render and refetch data
    setTokenInfoKey(prev => prev + 1);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet.connected || !wallet.publicKey) {
      setErrorMessage('Please connect your wallet first');
      return;
    }

    if (!recipientAddress) {
      setErrorMessage('Recipient address is required');
      return;
    }

    // Validate Solana address
    try {
      new PublicKey(recipientAddress);
    } catch (error) {
      setErrorMessage('Invalid Solana address');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setTransactionStatus('processing');
    setErrorMessage(null);

    try {
      const signature = await executeTokenTransfer(
        connection,
        wallet,
        recipientAddress,
        amountValue
      );

      setTransactionSignature(signature);
      setTransactionStatus('success');
      
      // Clear form on success
      setRecipientAddress('');
      setAmount('');
      
      // Refresh token info
      setTimeout(refreshTokenInfo, 2000);
      
      if (onSuccess) {
        onSuccess(signature);
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      
      setTransactionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      
      if (error instanceof Error && onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Send BIJLEE Tokens</h2>
          
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Address
              </label>
              <input
                id="recipient"
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Solana wallet address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                disabled={isLoading}
                required
              />
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  step="any"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  disabled={isLoading}
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">BIJLEE</span>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !wallet.connected}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                ${isLoading || !wallet.connected
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
            >
              {isLoading ? 'Processing...' : 'Send Tokens'}
            </button>
          </form>
          
          {transactionStatus === 'processing' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md text-blue-700">
              <p>Processing transaction... Please wait</p>
            </div>
          )}
          
          {transactionStatus === 'success' && transactionSignature && (
            <div className="mt-4 p-3 bg-green-50 rounded-md">
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
          
          {(transactionStatus === 'error' || errorMessage) && (
            <div className="mt-4 p-3 bg-red-50 rounded-md">
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
            </div>
          )}
        </div>
        
        <div>
          <TokenInfo key={tokenInfoKey} />
        </div>
      </div>
    </div>
  );
};

export default BijleeTransferForm;