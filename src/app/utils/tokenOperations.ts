// src/app/utils/tokenOperations.ts
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { BN } from '@coral-xyz/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';

// Replace with your token's mint address
const BIJLEE_TOKEN_MINT = new PublicKey('HQbqWP4LSUYLySNXP8gRbXuKRy6bioH15CsrePQnfT86');
// Replace with your program ID - this must match the ID in your deployed smart contract
const PROGRAM_ID = new PublicKey('Furu4efFjUJBs94Hc1MfJAg5nHZcP9y7F5qwtusTyG7i');

/**
 * Create a token transfer instruction
 */
export const createTokenTransferInstruction = async (
  senderPublicKey: PublicKey,
  recipientAddress: string,
  amount: number
): Promise<TransactionInstruction> => {
  try {
    const recipientPubkey = new PublicKey(recipientAddress);
    
    // Convert amount to proper units (assuming 9 decimals)
    const tokenDecimals = 9; // Adjust based on your token's decimal places
    const adjustedAmount = Math.floor(amount * Math.pow(10, tokenDecimals));
    
    // Encode the amount as a u64 in little-endian format
    const data = Buffer.alloc(8);
    (new BN(adjustedAmount)).toArrayLike(Buffer, 'le', 8).copy(data);
    
    // Get associated token addresses
    const senderTokenAccount = await getAssociatedTokenAddress(
      BIJLEE_TOKEN_MINT,
      senderPublicKey
    );
    
    const recipientTokenAccount = await getAssociatedTokenAddress(
      BIJLEE_TOKEN_MINT,
      recipientPubkey
    );
    
    return new TransactionInstruction({
      keys: [
        { pubkey: senderPublicKey, isSigner: true, isWritable: true },
        { pubkey: recipientPubkey, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: senderTokenAccount, isSigner: false, isWritable: true },
        { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
      ],
      programId: PROGRAM_ID,
      data: Buffer.concat([Buffer.from([0]), data]), // Instruction index 0 followed by amount
    });
  } catch (error) {
    console.error('Error creating transfer instruction:', error);
    throw error;
  }
};

/**
 * Get token account info and ensure it exists
 */
export const ensureTokenAccount = async (
  connection: Connection,
  owner: PublicKey,
  payer: PublicKey
): Promise<TransactionInstruction | null> => {
  try {
    const tokenAccount = await getAssociatedTokenAddress(
      BIJLEE_TOKEN_MINT,
      owner
    );
    
    // Check if account exists
    const accountInfo = await connection.getAccountInfo(tokenAccount);
    
    if (!accountInfo) {
      // Create token account if it doesn't exist
      return createAssociatedTokenAccountInstruction(
        payer,
        tokenAccount,
        owner,
        BIJLEE_TOKEN_MINT
      );
    }
    
    return null; // Account already exists
  } catch (error) {
    console.error('Error checking token account:', error);
    throw error;
  }
};

/**
 * Get token balance for a wallet
 */
export const getTokenBalance = async (
  connection: Connection,
  walletPublicKey: PublicKey
): Promise<number> => {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPublicKey,
      { mint: BIJLEE_TOKEN_MINT }
    );
    
    if (tokenAccounts.value.length === 0) {
      return 0;
    }

    const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    return balance;
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0;
  }
};

/**
 * Execute a token transfer
 */
export const executeTokenTransfer = async (
  connection: Connection,
  wallet: WalletContextState,
  recipientAddress: string,
  amount: number
): Promise<string> => {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    const transaction = new Transaction();
    const recipientPubkey = new PublicKey(recipientAddress);
    
    // Check if recipient has a token account, create if not
    const createAccountIx = await ensureTokenAccount(
      connection, 
      recipientPubkey, 
      wallet.publicKey
    );
    
    if (createAccountIx) {
      transaction.add(createAccountIx);
    }
    
    // Add the transfer instruction
    const transferIx = await createTokenTransferInstruction(
      wallet.publicKey,
      recipientAddress,
      amount
    );
    
    transaction.add(transferIx);
    
    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign and send transaction
    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    // Confirm transaction and throw error if confirmation fails
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    }, 'confirmed');
    
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
    }
    
    return signature;
  } catch (error) {
    console.error('Error executing token transfer:', error);
    throw error;
  }
};