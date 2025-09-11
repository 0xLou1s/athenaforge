# AthenaForge Setup Guide

## Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_PRIVY_APP_SECRET=your_privy_app_secret

# Pinata Configuration
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_PINATA_GATEWAY=your_pinata_gateway_domain.mypinata.cloud
```

## Pinata Setup

1. **Create Pinata Account**
   - Go to [pinata.cloud](https://pinata.cloud)
   - Sign up for an account

2. **Get API Key**
   - Go to API Keys section in your dashboard
   - Create a new API key with upload permissions
   - Copy the JWT token

3. **Setup Dedicated Gateway**
   - Go to Gateways section
   - Create a new dedicated gateway
   - Copy the gateway domain (e.g., `your-domain.mypinata.cloud`)

4. **Add to Environment**
   - Add the JWT token as `NEXT_PUBLIC_PINATA_JWT`
   - Add the gateway domain as `NEXT_PUBLIC_PINATA_GATEWAY`

## Privy Setup

1. **Create Privy App**
   - Go to [privy.io](https://privy.io)
   - Create a new app
   - Copy the App ID and App Secret

2. **Add to Environment**
   - Add the App ID as `NEXT_PUBLIC_PRIVY_APP_ID`
   - Add the App Secret as `NEXT_PUBLIC_PRIVY_APP_SECRET`

## Running the Application

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Start Development Server**
   ```bash
   pnpm dev
   ```

3. **Open Browser**
   - Visit [http://localhost:3000](http://localhost:3000)

## Features

- ✅ **Hackathon Creation**: Multi-step form with IPFS storage
- ✅ **Project Submission**: Team management and project links
- ✅ **IPFS Integration**: All data stored on IPFS via Pinata
- ✅ **Web3 Authentication**: Wallet connection via Privy
- ✅ **Responsive Design**: Mobile-friendly interface

## API Routes

The application uses Next.js API routes to proxy Pinata requests and avoid CORS issues:

- `/api/ipfs/upload` - Upload files to IPFS
- `/api/ipfs/upload-json` - Upload JSON data to IPFS

## Troubleshooting

### CORS Issues
If you encounter CORS errors, make sure you're using the API routes instead of calling Pinata directly from the client.

### Upload Failures
- Check that your Pinata JWT token is valid
- Ensure your Pinata account has sufficient credits
- Verify the gateway domain is correct

### Authentication Issues
- Make sure your Privy App ID is correct
- Check that the app is properly configured in Privy dashboard
