# Yol Asistan Frontend

Modern, responsive React + TypeScript frontend application for Yol Asistan insurance management platform.

## Features

- **Modern UI**: Built with Ant Design component library
- **Role-Based Access Control**: Support for 4 user roles (SUPER_ADMIN, AGENCY_ADMIN, BRANCH_ADMIN, BRANCH_USER)
- **Real-time Charts**: Beautiful statistics and analytics with Recharts
- **Multi-tenancy Support**: Automatic data filtering based on user role
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Turkish Localization**: Full Turkish language support

## Tech Stack

- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Ant Design** - Enterprise-level UI components
- **Recharts** - Composable charting library
- **Axios** - HTTP client with interceptors
- **React Router** - Client-side routing
- **Day.js** - Lightweight date manipulation

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Backend API running on http://localhost:3000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` to match your backend URL:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

3. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The optimized build will be in the `dist/` folder.

## Project Structure

```
src/
├── api/              # API configuration and axios setup
├── components/       # Reusable components
│   └── layout/      # Layout components (MainLayout)
├── contexts/        # React contexts (AuthContext)
├── pages/           # Page components
│   ├── auth/        # Login, Register
│   ├── dashboard/   # Dashboard with charts
│   ├── agencies/    # Agency management
│   ├── branches/    # Branch management
│   ├── users/       # User management
│   ├── customers/   # Customer management
│   ├── vehicles/    # Vehicle management
│   ├── packages/    # Package management
│   ├── sales/       # Sales management
│   └── payments/    # Payment management
├── routes/          # Route protection and configuration
├── services/        # API services
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Authentication

The app uses JWT-based authentication with automatic token refresh:

- Access tokens are stored in localStorage
- Refresh tokens are used to get new access tokens
- Expired sessions redirect to login page
- Protected routes require authentication

### Test Accounts

```
Super Admin:
Email: admin@yolasistan.com
Password: Admin123!

Agency Admin:
Email: ahmet.yilmaz@anadolu.com
Password: Admin123!

Branch Admin:
Email: fatma.ozturk@anadolu.com
Password: Admin123!

Branch User:
Email: can.yilmaz@anadolu.com
Password: User123!
```

## Role-Based Features

### SUPER_ADMIN
- Full access to all features
- Can manage agencies, branches, users
- Can view all data across the system

### AGENCY_ADMIN
- Can manage branches within their agency
- Can manage users within their agency
- Can view all data within their agency

### BRANCH_ADMIN
- Can manage users within their branch
- Can view all data within their branch

### BRANCH_USER
- Can only view and manage their own data
- Limited access to features

## Pages Overview

### Dashboard
- Total sales, revenue, commission, and customer statistics
- Monthly sales chart (area chart)
- Package distribution (pie chart)
- Sales statistics (bar chart)

### Agencies (SUPER_ADMIN only)
- List all agencies
- Create, update, delete agencies
- View agency balance and status

### Branches (SUPER_ADMIN, AGENCY_ADMIN)
- List branches
- Create, update, delete branches
- Filtered by user role

### Users (SUPER_ADMIN, AGENCY_ADMIN, BRANCH_ADMIN)
- List users
- View user roles and status
- Role-based filtering

### Customers
- Search customers by TC/VKN, name, surname
- Create, update, delete customers
- View customer details

### Vehicles
- List vehicles
- View vehicle details and owner

### Packages
- List insurance packages
- View package details and status

### Sales
- Create new sales
- Select customer, vehicle, and package
- Set pricing and dates
- View sales history

### Payments
- View payment history
- Filter by status and type
- Track transactions

## API Integration

All API calls are handled through services in `src/services/apiService.ts`:

- Automatic authentication header injection
- Token refresh on 401 errors
- Centralized error handling
- TypeScript type safety

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Ant Design design system
- Functional components with hooks

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist/` folder to your hosting provider:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Nginx

3. Configure your server to handle client-side routing:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
