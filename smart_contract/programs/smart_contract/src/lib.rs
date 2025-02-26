use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Your ProgramID"); // Replace with your program ID after deployment

#[program]
pub mod smart_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn transfer_tokens(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
        msg!("Transferring {} tokens", amount);
        
        // Create the transfer CPI instruction
        let transfer_instruction = Transfer {
            from: ctx.accounts.sender_token_account.to_account_info(),
            to: ctx.accounts.receiver_token_account.to_account_info(),
            authority: ctx.accounts.sender.to_account_info(),
        };
        
        // Execute the transfer with CPI (Cross-Program Invocation)
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
        );
        
        token::transfer(cpi_ctx, amount)?;
        
        msg!("Token transfer completed successfully");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct TransferTokens<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    
    /// CHECK: Receiver is just a pubkey, we don't need to validate it
    pub receiver: AccountInfo<'info>,
    
    #[account(
        mut,
        constraint = sender_token_account.owner == sender.key() @ ErrorCode::InvalidOwner
    )]
    pub sender_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = receiver_token_account.mint == sender_token_account.mint @ ErrorCode::MintMismatch
    )]
    pub receiver_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Token account owner does not match sender")]
    InvalidOwner,
    
    #[msg("Token mint addresses do not match")]
    MintMismatch,
}
