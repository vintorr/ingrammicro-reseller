# Ingram Micro Reseller Portal

A modern Next.js application for resellers to manage their Ingram Micro Xvantage integration. This portal provides a comprehensive interface for product search, price checking, order management, and quote creation.

## Features

- **Product Search** - Search and browse Ingram Micro's product catalog
- **Price & Availability** - Check real-time pricing and inventory availability
- **Order Management** - Create, track, and manage orders
- **Quote Management** - Create and manage customer quotes
- **Modern UI** - Built with Next.js 15, React 19, and Tailwind CSS

## Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Ingram Micro Xvantage API credentials

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Configure API Credentials

Copy the environment example file and fill in your Ingram Micro Xvantage API credentials:

```bash
cp env.example .env.local
```

Edit `.env.local` with your actual API credentials:

```env
# OAuth 2.0 Credentials (Server-side only - never expose in frontend)
INGRAM_MICRO_CLIENT_ID=your_client_id_here
INGRAM_MICRO_CLIENT_SECRET=your_client_secret_here

# API Configuration
INGRAM_MICRO_API_BASE_URL=https://api.ingrammicro.com:443
INGRAM_MICRO_TOKEN_URL=https://api.ingrammicro.com:443/oauth/oauth20/token

# Public configuration (safe to expose in frontend)
NEXT_PUBLIC_INGRAM_CUSTOMER_NUMBER=your_customer_number_here
NEXT_PUBLIC_INGRAM_COUNTRY_CODE=US
NEXT_PUBLIC_INGRAM_SENDER_ID=your_sender_id_here
```

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Credentials

To get your Ingram Micro Xvantage API credentials:

1. Contact Ingram Micro to set up your Xvantage integration
2. Obtain your Client ID, Client Secret, Subscription Key, Customer Number, and Sender ID
3. Configure the environment variables as shown above

**Required Credentials:**
- `CLIENT_ID` - Your OAuth 2.0 client ID (server-side only)
- `CLIENT_SECRET` - Your OAuth 2.0 client secret (server-side only)
- `CUSTOMER_NUMBER` - Your unique Ingram Micro customer number
- `COUNTRY_CODE` - Two-character ISO country code (e.g., "US", "CA", "GB")
- `SENDER_ID` - Your sender identification text

**Authentication Flow:**
This application uses OAuth 2.0 Client Credentials flow for secure API authentication. The OAuth tokens are managed server-side and never exposed to the frontend.

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   │   └── ingram/     # Ingram Micro API routes
│   │       ├── products/
│   │       ├── price-availability/
│   │       ├── orders/
│   │       └── quotes/
│   ├── layout.js       # Root layout
│   └── page.js         # Home page
├── components/         # React components
│   ├── Dashboard.js    # Main dashboard
│   ├── ProductSearch.js
│   ├── PriceAvailability.js
│   ├── OrderManagement.js
│   └── QuoteManagement.js
├── hooks/              # Custom React hooks
│   └── useIngramAPI.js # API call hook
└── lib/
    └── ingram-auth.js  # OAuth authentication utility
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## SDK Integration

This project uses the official [Ingram Micro Xvantage Node.js SDK](https://github.com/ingrammicro-xvantage/xi-sdk-resellers-node) version 1.2.0.

The SDK provides access to:
- Product Catalog API
- Orders API  
- Quotes API
- Returns API
- Renewals API
- Access Token API

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For Ingram Micro Xvantage API support, contact:
- Email: xi_support@ingrammicro.com
- Documentation: [Ingram Micro Xvantage API Docs](https://github.com/ingrammicro-xvantage/xi-sdk-resellers-node)
