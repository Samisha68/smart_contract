
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("Furu4efFjUJBs94Hc1MfJAg5nHZcP9y7F5qwtusTyG7i");

#[program]
pub mod bijlee_token {
    use super::*;

    // Initialize a new token with metadata and mint settings
    pub fn initialize_token(
        ctx: Context<InitializeToken>,
        name: String,
        symbol: String,
        decimals: u8,
    ) -> Result<()> {
        // Store token metadata in the token_info account
        let token_info = &mut ctx.accounts.token_info;
        token_info.name = name;
        token_info.symbol = symbol;
        token_info.decimals = decimals;
        token_info.mint = ctx.accounts.mint.key();
        token_info.mint_authority = ctx.accounts.mint_authority.key();
        token_info.total_supply = 0;

        // Initialize the mint account with specified decimals
        token::initialize_mint(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::InitializeMint {
                    mint: ctx.accounts.mint.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
            ),
            decimals,
            ctx.accounts.mint_authority.key,
            Some(ctx.accounts.mint_authority.key), // Optional freeze authority
        )?;

        Ok(())
    }

    // Mint new tokens to a specified account
    pub fn mint_tokens(
        ctx: Context<MintTokens>,
        amount: u64,
    ) -> Result<()> {
        // Verify the mint authority
        require!(
            ctx.accounts.mint_authority.key() == ctx.accounts.mint.mint_authority.unwrap(),
            BijleeError::InvalidMintAuthority
        );

        // Update total supply
        let token_info = &mut ctx.accounts.token_info;
        token_info.total_supply = token_info.total_supply.checked_add(amount)
            .ok_or(BijleeError::SupplyOverflow)?;

        // Mint new tokens
        token::mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
            ),
            amount,
        )?;

        Ok(())
    }

    // Transfer tokens between accounts
    pub fn transfer(
        ctx: Context<TransferTokens>,
        amount: u64,
    ) -> Result<()> {
        // Verify sufficient balance
        require!(
            ctx.accounts.from.amount >= amount,
            BijleeError::InsufficientBalance
        );

        // Execute the transfer
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.from.to_account_info(),
                    to: ctx.accounts.to.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                },
            ),
            amount,
        )?;

        Ok(())
    }

    // Burn tokens, reducing total supply
    pub fn burn(
        ctx: Context<BurnTokens>,
        amount: u64,
    ) -> Result<()> {
        // Update total supply
        let token_info = &mut ctx.accounts.token_info;
        token_info.total_supply = token_info.total_supply.checked_sub(amount)
            .ok_or(BijleeError::SupplyUnderflow)?;

        // Execute the burn
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Burn {
                    mint: ctx.accounts.mint.to_account_info(),
                    from: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                },
            ),
            amount,
        )?;

        Ok(())
    }
}

// Account structure to store token metadata
#[account]
pub struct TokenInfo {
    pub name: String,          // Token name
    pub symbol: String,        // Token symbol
    pub decimals: u8,          // Number of decimal places
    pub mint: Pubkey,          // Address of the mint account
    pub mint_authority: Pubkey, // Authority allowed to mint tokens
    pub total_supply: u64,     // Current total supply
}

// Account structure for token initialization
#[derive(Accounts)]
pub struct InitializeToken<'info> {
    #[account(
        init,
        payer = mint_authority,
        space = Mint::LEN,
        seeds = [b"bijlee_token"],
        bump
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = mint_authority,
        space = 8 +    // Discriminator
                32 +   // name
                32 +   // symbol
                1 +    // decimals
                32 +   // mint
                32 +   // mint_authority
                8      // total_supply
    )]
    pub token_info: Account<'info, TokenInfo>,
    
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

// Account structure for minting tokens
#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub token_info: Account<'info, TokenInfo>,
    
    pub mint_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

// Account structure for token transfers
#[derive(Accounts)]
pub struct TransferTokens<'info> {
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

// Account structure for burning tokens
#[derive(Accounts)]
pub struct BurnTokens<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub token_info: Account<'info, TokenInfo>,
    
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

// Custom error types for better error handling
#[error_code]
pub enum BijleeError {
    #[msg("Invalid mint authority")]
    InvalidMintAuthority,
    
    #[msg("Invalid token account owner")]
    InvalidTokenAccountOwner,
    
    #[msg("Insufficient balance for transfer")]
    InsufficientBalance,
    
    #[msg("Supply overflow")]
    SupplyOverflow,
    
    #[msg("Supply underflow")]
    SupplyUnderflow,
}