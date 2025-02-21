// app/utils/tokenOperations.ts
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Replace this with your actual token mint address from Solana Explorer
const BIJLEE_TOKEN_MINT = new PublicKey('HQbqWP4LSUYLySNXP8gRbXuKRy6bioH15CsrePQnfT86');
// Replace with your program ID
const PROGRAM_ID = new PublicKey('Enter_Your_Program_ID_Here');

export const createTokenTransferInstruction = (
  senderPublicKey: PublicKey,
  recipientAddress: string,
  amount: number
): TransactionInstruction => {
  try {
    const recipientPubkey = new PublicKey(recipientAddress);
    
    return new TransactionInstruction({
      keys: [
        {
          pubkey: senderPublicKey,
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: recipientPubkey,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: BIJLEE_TOKEN_MINT,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: PROGRAM_ID,
      data: Buffer.from([amount]), // Modify this based on your program's instruction data format
    });
  } catch (error) {
    console.error('Error creating transfer instruction:', error);
    throw error;
  }
};

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