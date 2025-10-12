# Application Structure

This application has been restructured to separate the public e-commerce site from the admin panel.

## Public Site (E-commerce)

The public site is located in `src/app/(public)/` and includes:

### Pages:
- **Home** (`/`) - Landing page with hero carousel, features, and featured products
- **Products** (`/products`) - Product search and browsing
- **Categories** (`/categories`) - Product categories with filtering
- **About** (`/about`) - Company information, team, and values
- **Contact** (`/contact`) - Contact form and company information

### Features:
- Modern e-commerce design with carousel
- Product search and filtering
- Shopping cart functionality
- Responsive navigation
- Company branding and information
- Contact forms

## Admin Panel

The admin panel is located in `src/app/(admin)/` and includes:

### Pages:
- **Dashboard** (`/admin`) - Overview with stats, recent orders, and quick actions
- **Products** (`/admin/products`) - Product management
- **Pricing** (`/admin/pricing`) - Price and availability management
- **Orders** (`/admin/orders`) - Order management
- **Quotes** (`/admin/quotes`) - Quote management
- **Analytics** (`/admin/analytics`) - Business analytics
- **Users** (`/admin/users`) - User management
- **Settings** (`/admin/settings`) - System settings

### Features:
- Sidebar navigation
- Dashboard with key metrics
- Management interfaces for all business functions
- Professional admin design

## Access Control

- **Public Site**: Accessible to all users
- **Admin Access**: Protected by password (`/admin-access`)
  - Demo password: `admin123`
- **Admin Panel**: Accessible after authentication

## Navigation

### Public Navigation:
- Home, Products, Categories, About, Contact
- Shopping cart
- User account
- Admin access link

### Admin Navigation:
- Dashboard, Products, Pricing, Orders, Quotes, Analytics, Users, Settings
- User profile and logout

## Components

### Shared Components:
- `ProductSearch` - Used in both public products page and admin products page
- `CartDrawer` - Shopping cart functionality
- `ProductCard`, `ProductListRow`, `ProductDetailsModal` - Product display components
- UI components (`Button`, `Badge`, `LoadingSpinner`)

### Admin-Specific Components:
- `Dashboard` - Admin dashboard (moved from main page)
- `OrderManagement` - Order management interface
- `QuoteManagement` - Quote management interface
- `PriceAvailability` - Price and availability management

## File Structure

```
src/app/
├── (public)/           # Public e-commerce site
│   ├── layout.tsx      # Public layout with navigation and footer
│   ├── page.tsx        # Home page with carousel
│   ├── products/       # Product browsing
│   ├── categories/     # Product categories
│   ├── about/          # About page
│   └── contact/        # Contact page
├── (admin)/            # Admin panel
│   ├── layout.tsx      # Admin layout with sidebar
│   ├── page.tsx        # Admin dashboard
│   ├── products/       # Product management
│   ├── pricing/        # Price management
│   ├── orders/         # Order management
│   └── quotes/         # Quote management
├── admin-access/       # Admin authentication
└── layout.tsx          # Root layout
```

## Getting Started

1. **Public Site**: Visit `/` to see the e-commerce site
2. **Admin Access**: Visit `/admin-access` and use password `admin123`
3. **Admin Panel**: After authentication, access `/admin` for the dashboard

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Icons**: Lucide React
- **TypeScript**: Full type safety
- **API Integration**: Ingram Micro APIs
