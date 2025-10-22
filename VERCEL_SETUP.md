# Deploying FastNet to Vercel

This guide shows you how to deploy FastNet to Vercel with **automatic deployments** from GitHub.

## ⚠️ Important Limitation

**FastNet uses Express.js backend**, which means:
- ✅ Vercel can host the **frontend** (React app)
- ❌ Vercel **cannot** host the full-stack app easily (serverless functions needed)
- 💡 **Recommendation**: Use **Render** instead for full-stack deployment

However, if you want to use Vercel, you have two options:

---

## 🎯 Option 1: Use Render + Vercel (Recommended)

**Best of both worlds:**
- **Backend on Render** (free tier, PostgreSQL included)
- **Frontend on Vercel** (fast global CDN)

### Setup Steps:

1. Deploy backend to Render (see `RENDER_SETUP.md`)
2. Get your Render backend URL (e.g., `https://fastnet-mtn-data.onrender.com`)
3. Deploy frontend to Vercel (instructions below)

---

## 🎯 Option 2: Full Deployment to Vercel (Advanced)

Convert Express routes to Vercel Serverless Functions.

### Prerequisites:
- Vercel account (sign up at https://vercel.com)
- External PostgreSQL database (use Render, Neon, or Supabase)

### Steps:

#### 1. Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub

#### 2. Install Vercel CLI in Replit
```bash
npm install -g vercel
```

#### 3. Create `vercel.json` Configuration

Create this file in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/dist/**",
      "use": "@vercel/static"
    },
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 4. Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your PostgreSQL URL (from Render/Neon/Supabase) |
| `SESSION_SECRET` | Random 32+ character string |
| `PAYSTACK_SECRET_KEY` | Your Paystack secret key |
| `PAYSTACK_PUBLIC_KEY` | Your Paystack public key |
| `DATAXPRESS_API_KEY` | Your DataXpress API key |
| `VITE_PAYSTACK_PUBLIC_KEY` | Same as PAYSTACK_PUBLIC_KEY |

#### 5. Deploy

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

---

## 🚫 Why Vercel Is Harder for FastNet

FastNet was built with **Express.js** (traditional server), but Vercel uses **serverless functions**:

| Feature | Express (Render) | Serverless (Vercel) |
|---------|-----------------|---------------------|
| Setup | Simple | Complex conversion |
| WebSockets | ✅ Supported | ❌ Not supported |
| Session Storage | ✅ In-memory | ❌ Needs external store |
| Database | ✅ Persistent connection | ⚠️ Connection pooling required |
| Cost | Free (750hrs/month) | Free (100GB bandwidth) |

---

## 💡 My Recommendation

**Use Render for FastNet** because:
1. ✅ **Zero configuration needed** - works out of the box
2. ✅ **Free PostgreSQL included** - no external database setup
3. ✅ **Persistent connections** - better for real-time features
4. ✅ **Simple deployment** - just connect GitHub and go
5. ✅ **Auto-deploy** - same as Vercel, pushes trigger deploys

**Only use Vercel if:**
- You already have a separate database (Neon, Supabase)
- You're comfortable converting Express to serverless
- You need Vercel's edge network for static content

---

## 🔗 External Database Options (if using Vercel)

If you still want Vercel, use these for PostgreSQL:

### 1. Neon (Recommended)
- **URL**: https://neon.tech
- **Free Tier**: 3GB storage, 1 project
- **Pros**: Serverless PostgreSQL, great for Vercel
- **Setup**: 5 minutes

### 2. Supabase
- **URL**: https://supabase.com
- **Free Tier**: 500MB database, 2GB bandwidth
- **Pros**: PostgreSQL + Auth + Storage
- **Setup**: 10 minutes

### 3. Render PostgreSQL
- **URL**: https://render.com
- **Free Tier**: 1GB storage, 90-day expiration
- **Pros**: Same place as backend
- **Setup**: Covered in RENDER_SETUP.md

---

## 🎯 Final Verdict

| Platform | Difficulty | Time to Deploy | Best For |
|----------|-----------|----------------|----------|
| **Render** | ⭐ Easy | 15 minutes | Full-stack apps (recommended) |
| **Vercel** | ⭐⭐⭐ Hard | 1-2 hours | Frontend-only or experienced devs |

**My advice**: Follow `RENDER_SETUP.md` instead. It's faster, simpler, and includes everything you need.

---

## 🆘 Need Help?

- **Render Issues**: See `RENDER_SETUP.md` troubleshooting section
- **Vercel Issues**: Check https://vercel.com/docs
- **Database Issues**: Use Render's built-in PostgreSQL

---

**Bottom Line**: Render is the easier, faster, and better choice for FastNet! 🚀
