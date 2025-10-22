# FastNet - MTN Data Package Sales Platform

Premium MTN data package sales platform for Ghana with Paystack payment integration and automatic DataXpress fulfillment.

![FastNet Banner](https://img.shields.io/badge/FastNet-MTN%20Data%20Sales-ffcb05?style=for-the-badge&logo=mtn)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)

---

## ✨ Features

### Customer Features
- 📱 **17 MTN Data Packages** - From 1GB to 100GB non-expiry data
- 💳 **Secure Payments** - Paystack integration with GHS (₵) currency
- ✉️ **Email Confirmations** - Instant order confirmation
- 🚀 **Instant Delivery** - Automatic data delivery via DataXpress API

### Admin Features
- 📊 **Real-Time Dashboard** - Order stats, revenue, and wallet balance
- 📦 **Package Management** - Add, edit, and delete data packages
- 🛒 **Order Management** - Track payment and fulfillment status
- 🔄 **Auto-Fulfillment** - Automatic order processing after payment
- 💰 **Wallet Monitoring** - Real-time DataXpress balance tracking
- 🔐 **Secure Authentication** - Replit Auth integration

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Paystack account ([Get started](https://paystack.com))
- DataXpress API key ([Get started](https://dataxpress.shop))

### Installation

```bash
# Clone the repository
git clone https://github.com/Wirelextechs/fastnet-mtn-data.git
cd fastnet-mtn-data

# Install dependencies
npm install

# Set up environment variables (see below)
# Create .env file with required secrets

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

---

## 🔐 Environment Variables

Create a `.env` file in the project root with these variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Session
SESSION_SECRET=your-super-secret-session-key-min-32-chars

# Paystack (Get from: https://dashboard.paystack.com/#/settings/developer)
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key

# DataXpress (Get from: https://dataxpress.shop)
DATAXPRESS_API_KEY=dx_your_api_key

# Frontend (for Vite build)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
```

**Generate secure SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🌐 Deployment Options

### Option 1: Render (Recommended) ⭐

**Best for:** Full-stack deployment with free PostgreSQL

- ✅ **100% Free tier** available
- ✅ **PostgreSQL included** (1GB storage)
- ✅ **Auto-deploy** from GitHub
- ✅ **SSL certificate** included
- ✅ **15 minute setup**

👉 **[Follow RENDER_SETUP.md](./RENDER_SETUP.md)** for step-by-step instructions

### Option 2: Vercel + External Database

**Best for:** Advanced users with separate database

- ⚠️ Requires converting Express to serverless functions
- 💡 Better suited for frontend-only deployments
- 🔗 Needs external PostgreSQL (Neon, Supabase, or Render)

👉 **[Follow VERCEL_SETUP.md](./VERCEL_SETUP.md)** for detailed guide

### Option 3: Stay on Replit

**Best for:** Development and testing

- ✅ Built-in database and hosting
- ✅ Real-time collaboration
- ⚠️ Requires Replit Core subscription ($20/month)

---

## 📝 Development Workflow

### Making Changes

1. **Edit code in Replit** or your local editor
2. **Test locally:** Changes auto-reload with Vite HMR
3. **Push to GitHub:**
   ```bash
   ./push.sh "Your commit message"
   ```
4. **Auto-deploy:** Render/Vercel automatically redeploys from GitHub

### Quick Push Script

The `push.sh` script makes GitHub updates easy:

```bash
# Make it executable (first time only)
chmod +x push.sh

# Use it to push changes
./push.sh "Added new feature"
./push.sh "Fixed bug in checkout"
./push.sh "Updated pricing"
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Shadcn UI |
| **Backend** | Express.js, Node.js, TypeScript |
| **Database** | PostgreSQL with Drizzle ORM |
| **Payments** | Paystack (Ghana) |
| **Fulfillment** | DataXpress API |
| **Authentication** | Replit Auth (OpenID Connect) |
| **Routing** | Wouter (React) |
| **State** | TanStack Query (React Query v5) |
| **Build** | Vite |

---

## 📂 Project Structure

```
fastnet-mtn-data/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components (Shadcn)
│   │   ├── pages/         # Route pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities
│   └── index.html
├── server/                # Express backend
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database layer
│   ├── dataxpress.ts      # DataXpress integration
│   ├── init.ts            # Database seeding
│   └── index.ts           # Server entry
├── shared/                # Shared types
│   └── schema.ts          # Database schema (Drizzle)
├── push.sh               # GitHub deployment script
├── RENDER_SETUP.md       # Render deployment guide
└── VERCEL_SETUP.md       # Vercel deployment guide
```

---

## 🎨 Design System

FastNet follows **MTN Ghana's brand identity**:

- **Primary Yellow**: `#ffcb05` - CTAs, highlights, branding
- **MTN Blue**: `#007bff` - Interactive elements, links
- **Deep Charcoal**: `#333` - Headers, dark sections
- **Success Green**: Order confirmations
- **Alert Red**: Delete actions and errors

See [`design_guidelines.md`](./design_guidelines.md) for complete specifications.

---

## 🔒 Security Features

- ✅ **Server-side pricing** - Prevents price tampering
- ✅ **Schema validation** - All inputs validated with Zod
- ✅ **Admin-only routes** - Protected with authentication middleware
- ✅ **Secure sessions** - Express sessions with PostgreSQL storage
- ✅ **Environment secrets** - Sensitive data in environment variables
- ✅ **HTTPS only** - SSL certificates on deployment platforms

---

## 📊 Admin Dashboard

### First-Time Access

1. **Auto-Admin Promotion**: The first user to log in automatically gets admin access
2. Navigate to `/admin` in your browser
3. Click login and authenticate via Replit Auth
4. Full admin access granted automatically

### Adding More Admins

```sql
-- Connect to your database and run:
UPDATE users SET is_admin = true WHERE email = 'user@example.com';
```

### Dashboard Features
- 📈 Total orders and revenue stats
- 💰 Real-time DataXpress wallet balance
- 📦 Manage packages (add/edit/delete)
- 🛒 Manage orders (view/update status/manual fulfill)
- 🔄 Auto-refresh every 5 seconds

---

## 🧪 Testing

### Manual Testing
1. Create test order on homepage
2. Use Paystack test card: `4084 0840 8408 4081` (any future expiry, any CVV)
3. Verify order appears in admin dashboard
4. Check fulfillment status

### Test Mode vs Live Mode
- **Test Mode**: Use Paystack test keys (`sk_test_...` / `pk_test_...`)
- **Live Mode**: Use Paystack live keys (`sk_live_...` / `pk_live_...`)
- DataXpress uses same API key for both

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Force rebuild database
npm run db:push --force
```

### Database Connection Issues
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
- Check database is running and accessible
- Ensure database has been initialized (auto-runs on first start)

### Paystack Webhook Not Working
- Verify webhook URL is publicly accessible (use deployed URL, not localhost)
- Check webhook is configured in Paystack dashboard
- Use ngrok for local testing: `ngrok http 5000`

### DataXpress Fulfillment Failing
- Check `DATAXPRESS_API_KEY` is correct
- Verify wallet has sufficient balance
- Check package data amount format (must be "XGB" format)
- View error messages in admin orders page

---

## 📖 API Documentation

### Public Endpoints
- `GET /api/packages` - List all active packages
- `POST /api/orders` - Create new order
- `GET /api/orders/reference/:ref` - Get order by Paystack reference
- `POST /api/webhooks/paystack` - Paystack payment webhook

### Protected Endpoints (Require Auth)
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate login
- `GET /api/logout` - Logout user

### Admin Endpoints (Require Auth + Admin)
- `GET /api/orders` - List all orders
- `PATCH /api/orders/:id` - Update order status
- `POST /api/orders/:id/fulfill` - Manually fulfill order
- `DELETE /api/orders/:id` - Delete order
- `POST /api/packages` - Create package
- `PATCH /api/packages/:id` - Update package
- `DELETE /api/packages/:id` - Delete package
- `GET /api/wallet/balance` - Get DataXpress wallet balance

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **MTN Ghana** - Brand inspiration
- **Paystack** - Payment processing
- **DataXpress** - Data delivery API
- **Replit** - Development platform
- **Shadcn UI** - Component library

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Wirelextechs/fastnet-mtn-data/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Wirelextechs/fastnet-mtn-data/discussions)
- **Email**: support@yourcompany.com

---

## 🗺️ Roadmap

- [ ] Email notifications for order confirmations
- [ ] SMS notifications via Twilio
- [ ] Support for other networks (Vodafone, AirtelTigo, Telecel)
- [ ] Advanced order filtering and search
- [ ] Data export (CSV/Excel)
- [ ] Customer order tracking page
- [ ] Mobile app (React Native)
- [ ] Bulk order discounts
- [ ] Referral program

---

## 📸 Screenshots

### Homepage
![Homepage - Package Selection](https://via.placeholder.com/800x400?text=FastNet+Homepage)

### Admin Dashboard
![Admin Dashboard](https://via.placeholder.com/800x400?text=Admin+Dashboard)

### Order Management
![Order Management](https://via.placeholder.com/800x400?text=Order+Management)

---

Made with ❤️ in Ghana 🇬🇭
