# Ingram Micro Reseller Portal

A modern, scalable ecommerce frontend built with Next.js 15, TypeScript, and Ingram Micro's reseller APIs. This application provides a comprehensive solution for resellers to manage products, orders, and quotes through an intuitive interface.

## Features

- 🚀 **Next.js 15** with App Router and Server-Side Rendering
- 🔐 **Secure OAuth 2.0** authentication with Ingram Micro APIs
- 📱 **Responsive Design** with Tailwind CSS
- ⚡ **Performance Optimized** with caching and lazy loading
- 🎯 **TypeScript** for type safety and better developer experience
- 🛒 **Shopping Cart** with Redux state management
- 📊 **Real-time Inventory** management
- 🔍 **Advanced Product Search** and filtering
- 📦 **Order Management** system
- 💰 **Price & Availability** checking

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **API Integration**: Ingram Micro Reseller APIs
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Active Ingram Micro reseller account
- Ingram Micro developer account with API access

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ingrammicro-reseller
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file and configure your Ingram Micro API credentials:

```bash
cp env.example .env.local
```

Update `.env.local` with your actual values:

```env
# Ingram Micro API Configuration
INGRAM_CLIENT_ID=your_client_id_here
INGRAM_CLIENT_SECRET=your_client_secret_here
INGRAM_CUSTOMER_NUMBER=your_customer_number_here
INGRAM_COUNTRY_CODE=US
INGRAM_SENDER_ID=YourCompany-Store

# API Configuration
INGRAM_API_BASE_URL=https://api.ingrammicro.com:443
INGRAM_SANDBOX_URL=https://api.ingrammicro.com:443/sandbox

# Environment
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── ingram/        # Ingram Micro API endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   └── providers.tsx     # Redux provider
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── product/          # Product-specific components
│   ├── cart/             # Shopping cart components
│   └── ...               # Other components
├── lib/                  # Core utilities
│   ├── api/              # API layer
│   │   └── ingram/       # Ingram Micro API services
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Redux store configuration
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── cache/            # Caching utilities
└── public/               # Static assets
```

## API Integration

The application integrates with Ingram Micro's reseller APIs:

- **Product Catalog**: Search and browse products
- **Price & Availability**: Real-time pricing and inventory
- **Orders**: Create and manage orders
- **Quotes**: Generate and manage quotes

### Authentication

The app uses OAuth 2.0 client credentials flow for secure API access. Tokens are automatically managed and refreshed as needed.

### Error Handling

Comprehensive error handling with user-friendly messages and proper HTTP status codes.

## State Management

Redux Toolkit is used for state management with the following slices:

- **Cart**: Shopping cart items, quantities, and totals
- **Products**: Product search results and filters
- **Auth**: Authentication state (future enhancement)

## Performance Optimizations

- **Server-Side Rendering**: Improved SEO and initial load times
- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Dynamic imports for better bundle sizes
- **Caching**: API response caching with Next.js cache utilities
- **Lazy Loading**: Components loaded on demand

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### TypeScript

The project is fully typed with TypeScript. All components, hooks, and utilities have proper type definitions.

### Code Style

- ESLint configuration for code quality
- Prettier for code formatting
- Consistent naming conventions

## Deployment

### Environment Variables

Ensure all required environment variables are set in your production environment:

- `INGRAM_CLIENT_ID`
- `INGRAM_CLIENT_SECRET`
- `INGRAM_CUSTOMER_NUMBER`
- `INGRAM_COUNTRY_CODE`
- `INGRAM_SENDER_ID`
- `INGRAM_API_BASE_URL`
- `NODE_ENV=production`

### Build and Deploy

```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:

- Check the [Ingram Micro API Documentation](https://developer.ingrammicro.com/)
- Review the code comments and TypeScript definitions
- Open an issue in the repository

## Roadmap

- [ ] User authentication and authorization
- [ ] Advanced product filtering
- [ ] Order tracking and status updates
- [ ] Quote management system
- [ ] Analytics and reporting
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Dark mode theme