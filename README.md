# Token transfering - Solana Full Stack Application

A full-stack decentralized application built on Solana blockchain for managing and transferring Bijlee tokens. This project combines a Solana smart contract with a Next.js frontend interface.


## Features

- Solana smart contract for token management
- Token minting and transfer capabilities
- Web interface for token interactions
- Wallet integration (Phantom, Solflare)
- Real-time balance updates
- Transaction history tracking

## Prerequisites

- Node.js (v16 or later)
- Rust and Cargo
- Solana CLI tools
- Anchor Framework
- A Solana wallet (Phantom or Solflare recommended)
## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smart_contract
```

2. Install dependencies:
```bash
# Install Rust dependencies
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup component add rustfmt

# Install Solana CLI tools
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked

# Install Node.js dependencies
npm install
```

3. Set up your Solana wallet:
```bash
solana-keygen new
```

## Smart Contract Development

1. Build the smart contract:
```bash
anchor build
```

2. Deploy to localnet:
```bash
solana-test-validator
anchor deploy
```

3. Update program ID:
- Copy the program ID from the deployment
- Update it in `lib.rs` and `Anchor.toml`

## Frontend Development

1. Start the development server:
```bash
npm run dev
```

2. Access the application:
```
http://localhost:3000
```

## Deployment

### Smart Contract Deployment

1. To devnet:
```bash
solana config set --url devnet
solana airdrop 2 # Get some test SOL
anchor deploy
```

2. To mainnet:
```bash
solana config set --url mainnet-beta
anchor deploy
```

### Frontend Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to your preferred hosting service (Vercel recommended):
```bash
vercel deploy
```

## Testing

1. Run smart contract tests:
```bash
anchor test
```

2. Run frontend tests:
```bash
npm test
```

## Troubleshooting

### Common Issues

1. **Wallet Connection Issues**
   - Ensure your wallet is installed and connected to the correct network
   - Check if you have sufficient SOL for transactions

2. **Build Errors**
   - Run `npm run clean-install` to fresh install dependencies
   - Ensure all required environment variables are set

3. **Transaction Failures**
   - Verify you have sufficient SOL for transaction fees
   - Check the program logs using `solana logs`

### Error Solutions

If you encounter the BigInt binding error:
```bash
npm run rebuild
```

For wallet adapter issues:
```bash
rm -rf node_modules .next
npm clean-install
```

## Environment Setup

Create a `.env.local` file:
```env
NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=your_program_id
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
